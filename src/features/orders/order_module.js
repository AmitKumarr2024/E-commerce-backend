import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    productDetails: {
      type: [
        {
          productId: String,
          name: String,
          price: Number,
          quantity: Number,
          image: String,
        },
      ],
      default: [],
    },
    email: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentDetails: {
      paymentId: {
        type: String,
        default: "",
      },
      payment_method_type: {
        type: [String],
        default: [],
      },
      payment_status: {
        type: String,
        default: "",
      },
    },
    shipping_options: {
      type: Array,
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
