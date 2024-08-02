import { request, response } from "express";
import stripe from "../../config/strip.js";
import UserModel from "../users/user_model.js";
import order_module from "./order_module.js";
import CartModel from "../cart/cart_model.js";

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
    const currectUserId = request.userId;

    const orderList = await order_module
      .find({ userId: currectUserId })
      .sort({ createdAt: -1 });

    response.status(201).json({
      data: orderList,
      message: "Order-List",
      success: true,
    });
  } catch (error) {
    response.json({
      message: error?.message || error,
      error: true,
      success: false,
    });
  }
};

export const cancelOrderController = async (request, response) => {
  try {
    const { productId, reason } = request.body;

    if (!productId) {
      return response.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    // Find the order based on productId
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

    // Store the cancellation reason
    if (reason) {
      order.cancellationReason = reason;
    } else {
      return response.status(400).json({
        message: "Cancellation reason is required",
        error: true,
        success: false,
      });
    }

    // Save the updated order with the cancellation reason
    await order.save();

    // Delete the order
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
