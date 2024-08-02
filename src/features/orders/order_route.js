import express from "express";
import {
  allOrder,
  cancelOrderController,
  orderDetails,
  paymentController,
  webhooks,
} from "./order_controller.js";
import jwtAuth from "../../middleware/authMeddleware.js";

const route = new express.Router();

route.post("/checkout", jwtAuth, paymentController);
route.post("/webhook", webhooks);
route.get("/order-list", jwtAuth, orderDetails);
route.post("/orders", jwtAuth, cancelOrderController);
route.get("/allorder", jwtAuth, allOrder);

export default route;
