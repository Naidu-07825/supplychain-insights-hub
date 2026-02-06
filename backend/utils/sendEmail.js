const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mail = {
    from: `"SupplyChain Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
  };

  if (html) mail.html = html;
  if (text) mail.text = text;

  await transporter.sendMail(mail);
};

module.exports = sendEmail;
