import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (email) {
          const emailCheck = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          return emailCheck.test(email);
        },
        message: "Email format is invalid",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (password) {
          return password.length >= 8;
        },
        message: "Password should be at least 8 characters",
      },
    },
    profilePic: {
      type: String,
    },
    role: { type: String, enum: ['ADMIN', 'GENERAL'], default: 'GENERAL' }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
