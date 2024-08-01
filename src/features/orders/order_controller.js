import stripe from "../../config/strip.js";
import UserModel from "../users/user_model.js";
import order_module from "./order_module.js";

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

// function retrive the data as per input recieve
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
        image: product.image,
      };
      ProductItems.push(productData);
    }
  }
  return ProductItems;
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

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const lineItems = await strip.checkout.sessions.listLineItems(
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
          shipping_options:session.shipping_options,
          totalAmount:session.amount_total/100,
        };

        const order = await order_module(OrderDetails);

        const saveOrder = await order.save();

        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
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
