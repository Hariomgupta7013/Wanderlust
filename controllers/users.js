const User = require("../models/user");

module.exports.renderSingupForm = (req, res) => {
    res.render("users/singUp.ejs");
};

module.exports.singup = async (req, res, next) => {
  try {
    const { username, email, password, Confirm_Password } = req.body;

    if (password !== Confirm_Password) {
      req.flash("error", "Passwords do not match!");
      return res.redirect("/singup");
    }

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/singup");
  }
};


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req, res) => {
    req.flash("success","Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};

