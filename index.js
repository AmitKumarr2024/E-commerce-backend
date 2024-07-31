import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connect from "./src/config/db.js";
import UserRoute from "./src/features/users/user_route.js";
import cookieParser from "cookie-parser";
import ProductRoute from "./src/features/products/product_route.js";
import CartRoute from "./src/features/cart/cart_route.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(cookieParser());

app.use(cors({
  origin: 'https://ecommercemarkets.netlify.app',
  credentials: true,
}));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Use cookie-parser middleware
app.use("/api/users", UserRoute);
app.use("/api/products", ProductRoute);
app.use("/api/cart", CartRoute);

// connect database and listen
connect().then(() => {
  app.listen(port, () => {
    console.log("Database is connected successfully");
    console.log("Server is connected successfully on port :", port);
  });
});
