import express from "express";
import { paymentController } from "./order_controller";
import jwtAuth from "../../middleware/authMeddleware";

const route = new express.Router();

route.post("/checkout", jwtAuth, paymentController);
