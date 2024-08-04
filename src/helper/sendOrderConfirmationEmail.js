import nodemailer from 'nodemailer';

// Create a transporter using your email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app-specific password
  }
});

// Example function to send email
const sendOrderConfirmationEmail = async (to, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: to, // receiver address
      subject: 'Order Confirmation', // subject line
      text: text, // email body
    });
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendOrderConfirmationEmail;