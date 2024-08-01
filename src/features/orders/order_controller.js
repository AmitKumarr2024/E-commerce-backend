import stripe from "../../config/strip.js";
import UserModel from "../users/user_model.js";

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

export const webhooks = async (request, response) => {
  try {
    const sig = request.headers["stripe-signature"];

    const payLoadString = JSON.stringify(request.body);

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: endpointSecret,
    });

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payLoadString,
        header,
        endpointSecret
      );
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    response.status(200).send();
  } catch (error) {
    response.json({
      message: error?.message || error,
      error: true,
      success: false,
    });
  }
};
