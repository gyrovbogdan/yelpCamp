const AsyncWrap = require("../utils/AsyncWrap"),
  AppError = require("../utils/AppError");

const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.postReview = AsyncWrap(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);

  const review = new Review({
    author: req.user.id,
    text: req.body.text,
    rate: req.body.rating,
  });
  try {
    await campground.pushReview(review);
  } catch (error) {
    req.flash("error", error.message);
  }
  res.redirect(`/campgrounds/${campground._id}`);
});

module.exports.editReview = AsyncWrap(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  await campground.editReviewById(req.params.reviewId, {
    text: req.body.text,
    rate: req.body.rating,
  });
  res.redirect(`/campgrounds/${req.params.id}`);
});

module.exports.deleteReview = AsyncWrap(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  const review = await Review.findById(req.params.reviewId);

  if (review.author.equals(req.user.id)) {
    campground.deleteReviewById(review._id);
  } else {
    flash("error", "You don't have permission to do this");
  }
  res.redirect(`/campgrounds/${req.params.id}`);
});

module.exports.renderEditReview = AsyncWrap(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  const review = await Review.findById(req.params.reviewId).populate(
    "author",
    "username"
  );

  if (review.author.equals(req.user.id)) {
    res.render("review/edit", { title: "Edit comments", campground, review });
  } else {
    flash("error", "You don't have permission to do this");
    res.redirect(`/campgrounds/${req.params.id}`);
  }
});
