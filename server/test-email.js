require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

transporter.sendMail({
  from: `"Manage My Campus" <${process.env.SMTP_FROM}>`,
  to: 'pemarinchen675@gmail.com',
  subject: 'Test email from Manage My Campus',
  html: '<p>This is a test email. If you receive this, email sending works correctly.</p>',
}, (err, info) => {
  if (err) {
    console.error('SEND ERROR:', JSON.stringify(err, null, 2));
  } else {
    console.log('SENT OK:', info.messageId, '| Response:', info.response);
  }
});
