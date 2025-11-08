const crypto = require("crypto");
const User = require("../models/user");
const nodemailer = require("nodemailer");

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "No user found with this email!");
    return res.redirect("/forgot-password");
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `http://localhost:8080/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yourEmail@gmail.com",
      pass: "yourAppPassword",
    },
  });

  await transporter.sendMail({
    to: user.email,
    subject: "Reset Your Password",
    html: `<p>Click here to reset password:</p><a href="${resetUrl}">${resetUrl}</a>`,
  });

  req.flash("success", "Password reset link sent to your email.");
  res.redirect("/login");
};
