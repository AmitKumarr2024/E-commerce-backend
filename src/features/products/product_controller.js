import { uploadProductPermission } from "../../helper/permission.js";
import user_model from "../users/user_model.js";
import ProductModel from "./product_model.js";

export const createProduct = async (req, res) => {
  try {
    const sessionUserId = req.userId;

    // Check if user exists and has permission to upload a product
    const user = await user_model.findById(sessionUserId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "ADMIN") {
      throw new Error("Permission Denied");
    }

    const uploadProduct = new ProductModel(req.body);
    const saveProduct = await uploadProduct.save();

    res.status(200).json({
      message: "Product request created successfully",
      data: saveProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to create product",
      error: true,
      success: false,
    });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const allProduct = await ProductModel.find();
    if (!allProduct) {
      return res.status(401).json({
        message: "No Prodcuts are available",
      });
    }
    res.status(200).json({
      message: "Request completed Successfully",
      data: allProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to create product",
      error: true,
      success: false,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!uploadProductPermission(req.userId)) {
      return res.status(403).json({
        message: "Permission Denied",
        error: true,
        success: false,
      });
    }

    const { _id, ...resBody } = req.body;

    

    // Ensure _id is provided
    if (!_id) {
      return res.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    const updateProduct = await ProductModel.findByIdAndUpdate(_id, resBody, {
      new: true,
    });

    if (!updateProduct) {
      return res.status(404).json({
        message: "No product found with the provided ID",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: updateProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to update product",
      error: true,
      success: false,
    });
  }
};

export const getCategoryProduct = async (req, res) => {
  try {
    const productCategory = await ProductModel.distinct("category");


    const productByCategory = [];

    for (const category of productCategory) {
      const products = await ProductModel.findOne({ category });

      if (products) {
        productByCategory.push(products);
      }
    }
    res.status(200).json({ productByCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};

export const getSelectedCategory = async (req, res) => {
  try {
    const category = req.body.category || req.query.category;
    if (!category) {
      return res.status(400).json({
        message: "Category is required",
        error: true,
        success: false,
      });
    }

    const selectedProduct = await ProductModel.find({ category });

    if (selectedProduct.length === 0) {
      return res.status(404).json({
        message: "No such Category is Available",
        data: [],
        error: false,
        success: true,
      });
    }

    res.status(200).json({
      message: "Request completed successfully",
      data: selectedProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(400).json({ message: "Product is Not Available" });
    }

    res.status(200).json({
      message: "Request completed Successfully",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const query = req.query.q;
    const regex = new RegExp(query, "i", "g");

    const product = await ProductModel.find({
      $or: [
        {
          productName: regex,
        },
        {
          category: regex,
        },
      ],
    });

    if (!product) {
      return res.status(400).json({
        message: "sorry not Search is present",
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      message: "Search request completed successfully",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};

export const filterProduct = async (req, res) => {
  try {
    const categoryList = req.body?.category || [];

    const categoryProduct = await ProductModel.find({
      category: {
        $in: categoryList,
      },
    });

    if (!categoryProduct) {
      return res
        .status(400)
        .json({ message: "category not found", error: true, success: false });
    }
    res.status(200).json({
      message: "Category request is completed",
      data: categoryProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};
