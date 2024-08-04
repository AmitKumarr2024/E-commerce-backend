import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

const sendOrderConfirmationEmail = (to, orderDetails) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to,
    subject: 'Order Confirmation',
    text: `Thank you for your order! Here are your order details: ${orderDetails}`
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
};

export default sendOrderConfirmationEmail;
