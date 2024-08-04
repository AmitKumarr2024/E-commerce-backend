import nodemailer from 'nodemailer';

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
      to: to, // receiver
      subject: 'Order Confirmation', // subject line
      text: text, // email body
    });
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendOrderConfirmationEmail;