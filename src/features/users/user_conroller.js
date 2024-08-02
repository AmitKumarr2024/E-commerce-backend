import UserModel from "./user_model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// SignUp Controller
import dotenv from "dotenv";
dotenv.config();

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    if (!hashPassword) {
      throw new Error("Something went wrong");
    }

    const payload = {
      ...req.body,
      role: "GENERAL",
      password: hashPassword,
    };

    const userData = new UserModel(payload);
    const saveUser = await userData.save();
    res.status(201).json({
      data: saveUser,
      success: true,
      error: false,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: true, error: error.message });
  }
};

// Login Controller

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userExist = await UserModel.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: "User Not Found!!" });
    }

    // Check password validity
    const isValidPassword = await bcrypt.compare(password, userExist.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Check if user is already logged in
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        if (decoded._id === userExist._id.toString()) {
          return res.status(400).json({ message: "You are already Logged in" });
        }
      } catch (err) {
        // Token is invalid or expired
        res.status(400).json({"Invalid or expired token:", err.message});
      }
    }

    // Prepare token data
    const tokenData = {
      _id: userExist._id,
      email: userExist.email,
    };

    // Generate token
    const newToken = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: 24 * 60 * 60, // Token expiry set to 8 hours
    });

    // Determine if the environment is production
    const isProduction = process.env.NODE_ENV === "production";

    const tokenOptions = {
      httpOnly: true,
      secure: true, // Secure cookies only in production
      sameSite: isProduction ? "None" : "Lax", // Adjust for development vs. production
    };

    // Set cookie and respond
    res.cookie("token", newToken, tokenOptions).status(200).json({
      message: "Login successful",
      data: newToken,
      success: true,
      error: false,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: true, success: false });
  }
};

// user Details

export const userDetails = async (req, res) => {
  try {
    // Check if userId is present in the request
    if (!req.userId) {
      return res.status(400).json({
        message: "User ID is missing",
        error: true,
        success: false,
      });
    }

    // Fetch user details from the database
    const user = await UserModel.findById(req.userId);

    // Check if user exists
    if (!user) {
      console.error("User not found for ID:", req.userId);
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Send user details in response
    res.status(200).json({
      data: user,
      message: "User details retrieved successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      message: "An error occurred while fetching user details",
      error: true,
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/", // Ensure the path matches the one used during setting the cookie
    });

    // Send a successful response
    res.status(200).json({
      message: "Logged out successfully",
      error: false,
      success: true,
      data: [],
    });
    // End the response explicitly
  } catch (err) {
    // Send an error response
    res.status(500).json({
      message: err.message || "An error occurred during logout",
      error: true,
      success: false,
    });
    // End the response explicitly
  }
};

// all users
export const allUser = async (req, res) => {
  try {
    const user = await UserModel.find();

    if (!user) {
      return res.status(400).json({
        message: "No User available",
        data: [],
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      message: "Request complete Successfully",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went Wrong in Logout",
      error: true,
      success: false,
    });
  }
};

export const userUpdate = async (req, res) => {
  try {
    const sessionUserId = req.userId;
    const { userId, email, name, role } = req.body;

    const userExist = await UserModel.findById(sessionUserId);
    if (!userExist) {
      return res.status(400).json({ msg: "User not Exist" });
    }
    console.log("user.role:", userExist.role);

    const payload = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
    };

    const updatedUser = await UserModel.findByIdAndUpdate(userId, payload, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({
        data: [],
        message: "User not found",
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      message: "User Updated Successfully",
      data: updatedUser,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong in user update",
      error: true,
      success: false,
    });
  }
};
