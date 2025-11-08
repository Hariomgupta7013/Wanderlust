const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js");

// forgot password 
const authController = require("../controllers/authController.js");

router.route("/singup")
.get(userController.renderSingupForm)
.post(wrapAsync(userController.singup))


router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true,}), userController.login)


router.get("/logout", userController.logout);




router.get("/forgot-password", (req, res) => {
  res.render("users/forgotPassword");
});

router.post("/forgot-password", authController.forgotPassword);


module.exports = router;
