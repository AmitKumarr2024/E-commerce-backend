import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      ref:"Product"
    },
    quantity: {
      type: Number,
    },
    userId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CartModel = mongoose.model("Cart", cartSchema);

export default CartModel;
