const AsyncWrap = require("../utils/AsyncWrap"),
  AppError = require("../utils/AppError");

const passport = require("passport");
const User = require("../models/user");

module.exports.renderUserAuthenticated = AsyncWrap(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("campgrounds");
  if (!user) throw AppError(404, "User Not Found");
  res.render("user/authenticated", {
    title: user.username,
    user: user,
  });
});

module.exports.registerUser = AsyncWrap(async (req, res, next) => {
  const { username, email, password } = req.body;
  let user = new User({ username, email });
  try {
    user = await User.register(user, password);
    req.login(user, (err) => {
      if (err) throw AppError("Can`t authorise", 500);
      else res.redirect("/user");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/user/register");
  }
});

module.exports.renderUserEdit = AsyncWrap(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.render("user/edit", { title: "Edit Account", user });
});

module.exports.renderLogin = (req, res) => {
  res.render("user/login", { title: "Log In" });
};

module.exports.renderRegister = (req, res) => {
  res.render("user/register", { title: "Sing Up" });
};

module.exports.renderUserById = AsyncWrap(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("campgrounds");
  res.render("user/user", { title: user.username, user });
});

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

module.exports.authenticate = passport.authenticate("local", {
  failureRedirect: "/user/login",
  successFlash: true,
  failureFlash: true,
  successRedirect: "/user",
});

module.exports.deleteUser = AsyncWrap(async (req, res, next) => {
  await User.findOneAndDelete({ _id: req.user._id });
  if (req.user._id.equals(req.params.id)) {
    req.logout((err) => {
      if (err) throw AppError(500, "Error");
    });
    res.redirect("/user/register");
  } else {
    req.flash("error", "Dont have permission to do that");
    res.redirect("/");
  }
});

module.exports.changePassword = AsyncWrap(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  await user.changePassword(
    req.body.oldPassword,
    req.body.newPassword,
    (err) => {
      if (err) req.flash("error", err.message);
      else req.flash("success", "Password successfully changed");
      res.redirect("/user");
    }
  );
});

module.exports.renderChangePassword = AsyncWrap(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.render("user/changePassword", { title: "Change Password", user });
});

module.exports.editUser = AsyncWrap(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    {
      username: req.body.username,
      email: req.body.email,
    },
    { returnDocument: "after" }
  );
  req.login(user, (err) => {
    if (err) throw AppError(500, "Can't authorise");
    else res.redirect("/user/changePassword");
  });
});
