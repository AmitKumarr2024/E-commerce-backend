import express from "express";
import { paymentController } from "./order_controller.js";
import jwtAuth from "../../middleware/authMeddleware.js";

const route = new express.Router();

route.post("/checkout", jwtAuth, paymentController);


export default route;