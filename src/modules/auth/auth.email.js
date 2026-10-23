const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

 const sendEmail = async (options) => {
  console.log("\n========== EMAIL ==========");
  console.log("To:", options.email);
  console.log("Subject:", options.subject);
  console.log("Message:", options.message);
  console.log("===========================\n");

  return true;
};
module.exports = sendEmail;