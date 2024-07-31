import Strip from "stripe";

const strip = Strip(process.env.STRIPE_SECRET_KEY);

export default strip;
