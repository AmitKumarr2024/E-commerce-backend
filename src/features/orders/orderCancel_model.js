import mongoose from "mongoose";

const cancellationSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    cancelledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cancellation", cancellationSchema);
