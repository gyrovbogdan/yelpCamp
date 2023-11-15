module.exports.localsMiddleware = (req, res, next) => {
  res.locals.url = req.url;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.info = req.flash("info");
  res.locals.isAuthorised = req.user;
  res.locals.query = req.query;
  next();
};

module.exports.isAuthenticated = (req, res, next) => {
  if (req.user) next();
  else {
    req.flash("error", "Need to authenticate");
    res.redirect("/user/login");
  }
};

const Campground = require("../models/campground"),
  User = require("../models/user");
const AsyncWrap = require("./AsyncWrap");

module.exports.isAuthor = AsyncWrap(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const campground = await Campground.findById(req.params.id);

  if (user.campgrounds.indexOf(campground._id) !== -1) {
    res.locals.campground = campground;
    next();
  } else {
    req.flash("error", "You don't have permission to edit that campground");
  }
});

const { escape } = require("validator");

module.exports.sanitizeReqBody = (req, res, next) => {
  for (let i in req.body) req.body[i] = escape(req.body[i]);
  next();
};

module.exports.ErrorHandler = (err, req, res, next) => {
  console.log(err);
  req.flash("error", `ERROR ${err}`);
  res.redirect("/");
};
