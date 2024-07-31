import CartModel from "../cart/cart_model.js";
import mongoose from "mongoose";

export const createCart = async (req, res) => {
  try {
    // Extract productId and userId from request body and ensure proper type
    const { productId, quantity = 1 } = req.body;
    const userId = req.userId;

    // Validate productId and userId
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        message: "Invalid Product ID or User ID",
        error: true,
        success: false,
      });
    }

    // Check if the product already exists in the cart
    const isProductExist = await CartModel.findOne({ productId, userId });

    if (isProductExist) {
      return res.status(400).json({
        message: "Product already in cart",
        error: true,
        success: false,
      });
    }

    // Create new cart product
    const payLoad = {
      productId,
      quantity,
      userId,
    };

    const newCartProduct = new CartModel(payLoad);
    const saveCart = await newCartProduct.save();

    res.status(200).json({
      message: "Product Added to cart Successfully",
      data: saveCart,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};

export const countItemsCart = async (req, res) => {
  try {
    const userId = req?.userId;

    const itemsCartExist = await CartModel.countDocuments({ userId });

    if (!itemsCartExist) {
      return res.status(400).json({
        message: "No Items is add to cart",
        error: "true",
        success: "false",
      });
    }

    res.status(200).json({
      message: "Request is completed Successfully",
      data: {
        count: itemsCartExist,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};

export const cartItemsView = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItemExist = await CartModel.find({ userId }).populate(
      "productId"
    );
    if (!cartItemExist) {
      return res.status(404).json({
        message: "No Any Product Is Available in cart",
        error: true,
        success: false,
      });
    }
    res.status(200).json({
      message: "Request is Successfully completed.",
      data: cartItemExist,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};

export const updateAddtoCartProduct = async (req, res) => {
  try {
    const addToCartproductId = req.body.id; // Ensure you're using 'id' and not '_id'
    const qtn = req.body.quantity;

    if (!addToCartproductId || qtn === undefined) {
      return res.status(400).json({
        message: "Invalid request. Product ID and quantity are required.",
        error: true,
        success: false,
      });
    }

    const updateProduct = await CartModel.updateOne(
      { _id: addToCartproductId }, // Filter to find the correct product
      { $set: { quantity: qtn } } // Update quantity
    );

    if (updateProduct.nModified === 0) {
      return res.status(400).json({
        message: "Sorry, no update operation took place.",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: updateProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};

export const deleteAddToCartProduct = async (req, res) => {

  //only delete from cart not from database  so use deleteOne and use post method
  try {
    const currentUserId = req.userId;
    const addToCartproductId = req.body._id;

    const deleteProduct= await CartModel.deleteOne({id:addToCartproductId})

    res.status(200).json({
      message:"Item Deleted successfully",
      data:deleteProduct,
      error:false,
      success:true
    })


  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to complete request.",
      error: true,
      success: false,
    });
  }
};
