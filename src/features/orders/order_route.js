import express from "express";
import {
  allOrder,
  cancelOrderController,
  orderDetails,
  paymentController,
  sendOrderConfirmationEmail,
  webhooks,
} from "./order_controller.js";
import jwtAuth from "../../middleware/authMeddleware.js";

const route = new express.Router();

route.post("/checkout", jwtAuth, paymentController);
route.post("/webhook", webhooks);
route.get("/order-list", jwtAuth, orderDetails);
route.post("/orders", jwtAuth, cancelOrderController);
route.get("/all-order", jwtAuth, allOrder);
route.post('/send-order-confirmation',jwtAuth,sendOrderConfirmationEmail)

export default route;
