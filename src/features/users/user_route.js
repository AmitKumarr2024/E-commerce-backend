import express from "express";
import {
  allUser,
  login,
  logout,
  signUp,
  userDetails,
  userUpdate,
} from "./user_conroller.js";
import jwtAuth from "../../middleware/authMeddleware.js";
const route = new express.Router();

route.post("/signup", signUp);
route.post("/login", login);
route.get("/user-details", jwtAuth, userDetails);
route.get("/logout", logout);

// for admin control pannle
route.get("/all-user",jwtAuth, allUser);
route.post('/user-update',jwtAuth,userUpdate)

export default route;
