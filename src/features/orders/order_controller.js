import stripe from "../../config/strip.js";
import UserModel from "../users/user_model.js";

export const paymentController = async (request, response) => {
  try {
    const { cartItems } = request.body;
    const user = await UserModel.findOne({ _id: request.userId });
    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"], // corrected from "cards" to "card"
      billing_address_collection: "auto",
      shipping_options: [
        {
          shipping_rate: "shr_1PibdXRpn6sy8R3GXug27qaK",
        },
      ],
      customer_email: user.email,
      line_items: cartItems.map((items, index) => {
        return {
          price_data: { // corrected from price_Data to price_data
            currency: "inr",
            product_data: {
              name: items.productId.productName,
              images: [items.productId.productImage], // should be an array of strings
              metadata: {
                productId: items.productId._id,
              },
            },
            unit_amount: items.productId.selling * 100, // Stripe expects amount in the smallest currency unit (e.g., paise for INR)
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1
          },
          quantity: items.quantity
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
