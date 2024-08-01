import express from "express";
import { paymentController, webhooks } from "./order_controller.js";
import jwtAuth from "../../middleware/authMeddleware.js";

const route = new express.Router();

route.post("/checkout", jwtAuth, paymentController);
route.post("webhook", webhooks);

export default route;
