import express from "express";
import {
  cartItemsView,
  countItemsCart,
  createCart,
  deleteAddToCartProduct,
  updateAddtoCartProduct,
} from "./cart_controller.js";
import jwtAuth from "../../middleware/authMeddleware.js";

const route = new express.Router();

route.post("/addToCart", jwtAuth, createCart);
route.get("/cart-items", jwtAuth, countItemsCart);
route.get("/cart-final", jwtAuth, cartItemsView);
route.post("/update-cart", jwtAuth, updateAddtoCartProduct);
route.post('/delete-cart',jwtAuth,deleteAddToCartProduct)

export default route;
