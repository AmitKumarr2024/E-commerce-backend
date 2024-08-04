const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use a different email service
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your email password or app-specific password
  },
});

const sendOrderConfirmationEmail = async (to, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: to, // list of receivers
      subject: 'Order Confirmation', // Subject line
      text: text, // plain text body
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
