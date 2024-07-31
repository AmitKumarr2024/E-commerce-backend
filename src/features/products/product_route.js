import express from "express";
import {
  createProduct,
  filterProduct,
  getAllProduct,
  getCategoryProduct,
  getProductDetails,
  getSelectedCategory,
  searchProduct,
  updateProduct,
} from "./product_controller.js";
import jwtAuth from "../../middleware/authMeddleware.js";

const route = express.Router();

route.post("/create", jwtAuth, createProduct);
route.get("/all-product", jwtAuth, getAllProduct);
route.post("/update-product", jwtAuth, updateProduct);
// to dispaly
route.get("/get-category", getCategoryProduct);
route.post("/select-category", getSelectedCategory);
route.post("/product", getProductDetails);
route.get("/search", searchProduct);
route.post("/category", filterProduct);

export default route;
