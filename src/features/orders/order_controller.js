import { request, response } from "express";
import stripe from "../../config/strip.js";
import UserModel from "../users/user_model.js";
import order_module from "./order_module.js";
import CartModel from "../cart/cart_model.js";
import Cancellation from "../orders/orderCancel_model.js";
import user_model from "../users/user_model.js";
import sendOrderConfirmationEmail from "../../helper/sendOrderConfirmationEmail.js";
// this is secret key
const endpointSecret = process.env.STRIPE_END_POINT_SECRET_KEY;

export const paymentController = async (request, response) => {
  try {
    const { cartItems } = request.body;
    const user = await UserModel.findOne({ _id: request.userId });

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      shipping_options: [
        {
          shipping_rate: "shr_1PibdXRpn6sy8R3GXug27qaK",
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: request.userId,
      },
      line_items: cartItems.map((items, index) => {
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: items.productId.productName,
              images: items.productId.productImage,
              metadata: {
                productId: items.productId._id,
              },
            },
            unit_amount: items.productId.selling * 100,
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
          },
          quantity: items.quantity,
        };
      }),
      success_url: `${process.env.FRONTEND_DOMAIN}/success`,
      cancel_url: `${process.env.FRONTEND_DOMAIN}/cancel`,
    };

    const session = await stripe.checkout.sessions.create(params);
    response.status(303).json(session);
  } catch (error) {
    response.json({
      message: error?.message || error,
      error: true,
      success: false,
    });
  }
};

// function
const getLineItems = async (lineItems) => {
  const ProductItems = [];

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await stripe.products.retrieve(item.price.product);
      const productId = product.metadata.productId;

      const productData = {
        productId: productId,
        name: product.name,
        price: item.price.unit_amount / 100,
        quantity: item.quantity,
        image: product.images[0], // Ensure you handle images array correctly
      };
      ProductItems.push(productData);
    }
  }
  return ProductItems;
};

export const webhooks = async (request, response) => {
  try {
    const sig = request.headers["stripe-signature"];

    const payloadString = JSON.stringify(request.body);

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      sig,
      secret: endpointSecret,
    });

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payloadString,
        header, // Use the signature from request headers
        endpointSecret
      );
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id
        );
        const productDetails = await getLineItems(lineItems);

        const OrderDetails = {
          productDetails: productDetails,
          email: session.customer_email,
          userId: session.metadata.userId,
          paymentDetails: {
            paymentId: session.payment_intent,
            payment_method_type: session.payment_method_types,
            payment_status: session.payment_status,
          },
          shipping_options: session.shipping_options.map((s) => {
            return {
              ...s,
              shipping_amount: s.shipping_amount / 100,
            };
          }),
          totalAmount: session.amount_total / 100,
        };

        const order = order_module(OrderDetails);

        const saveOrder = await order.save();

        if (saveOrder?._id) {
          const deleteCartItems = await CartModel.deleteMany({
            userId: session.metadata.userId,
          });
        }

        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    response.status(200).send();
  } catch (error) {
    console.error("Webhook error:", error);
    response.status(500).json({
      message: error?.message || error,
      error: true,
      success: false,
    });
  }
};

export const orderDetails = async (request, response) => {
  try {
    const currentUserId = request.userId;

    // Fetch orders for the current user
    const orderList = await order_module
      .find({ userId: currentUserId })
      .sort({ createdAt: -1 });

    // Log order list to debug
    console.log('Order List:', orderList);

    // Check if there are any orders
    if (orderList.length === 0) {
      console.log('No orders found for the user.');
      response.status(200).json({
        data: [],
        message: "No orders found",
        success: true,
      });
      return;
    }

    // Format the order details for email
    const user = await user_model.findById(currentUserId); // Fetch user details if needed
    const orderDetails = orderList.map(order => 
      `Order ID: ${order._id}, Created At: ${order.createdAt}, Total: ${order.total}`
    ).join('\n');

    // Log formatted order details
    console.log('Formatted Order Details:', orderDetails);

    // Send email with order details (optional)
    if (user && user.email) {
      try {
        await sendOrderConfirmationEmail(user.email, `Here are your order details:\n\n${orderDetails}`);
        console.log('Email sent successfully to:', user.email);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Email failure is logged but does not affect the order list response
      }
    }

    // Send the response with order details
    response.status(200).json({
      data: orderList,
      message: "Order list fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error('Error in orderDetails function:', error);
    response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};



export const cancelOrderController = async (request, response) => {
  try {
    const { productId, reason } = request.body;
    console.log("reason", reason);
    console.log("productId", productId);

    if (!productId || !reason) {
      return response.status(400).json({
        message: "Product ID and reason are required",
        error: true,
        success: false,
      });
    }

    const order = await order_module.findOne({
      "productDetails.productId": productId,
    });

    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    const cancellation = new Cancellation({
      orderId: order._id,
      productId: productId,
      reason: reason,
    });
    await cancellation.save();

    await order_module.findByIdAndDelete(order._id);

    response.status(200).json({
      message: "Order canceled successfully",
      success: true,
    });
  } catch (error) {
    response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export const allOrder = async (request, response) => {
  try {
    const userId = request.userId;

    const userExist = await user_model.findById(userId);

    if (userExist.role !== "ADMIN") {
      return response.status(400).json({
        message: "Access Denied!!!",
        error: true,
      });
    }

    const allOrder = await order_module.find().sort({ createdAt: -1 }).populate('userId');

    response.status(200).json({
      message: "Request completed successfully",
      data: {
        orders: allOrder,
      },
      success: true,
    });
  } catch (error) {
    response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};