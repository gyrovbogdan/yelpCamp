const Campground = require("../models/campground"),
  User = require("../models/user"),
  Review = require("../models/review");

const cloudinary = require("cloudinary");

const AsyncWrap = require("../utils/AsyncWrap"),
  AppError = require("../utils/AppError");

module.exports.renderCampgrounds = AsyncWrap(async (req, res, next) => {
  const count = await Campground.count({});
  const LIMIT = 10;

  let { page, sort } = req.query;
  let sortQuery;
  switch (sort) {
    case "highest-rated":
      sortQuery = { rating: -1 };
      break;
    case "highest-price":
      sortQuery = { price: -1 };
      break;
    case "lowest-price":
      sortQuery = { price: 1 };
      break;
    case "newest":
      sortQuery = {};
      break;
    default:
      sortQuery = { rating: -1 };
      break;
  }
  if (!Number(page) || page * LIMIT > count || page < 0) page = 0;
  const campgrounds = await Campground.find({})
    .sort(sortQuery)
    .populate("author", "username")
    .skip(page * LIMIT)
    .limit(LIMIT);
  res.render("campground/campgrounds", {
    title: "Campgrounds",
    campgrounds,
    currentPage: page,
    countOfPages: count / LIMIT,
  });
});

module.exports.renderNewCampground = (req, res) => {
  res.render("campground/new", {
    title: "New Campground",
  });
};

module.exports.renderEditCampground = (req, res) => {
  res.render("campground/edit", {
    title: `Edit ${res.locals.campground.title}`,
  });
};

module.exports.renderCampground = AsyncWrap(async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate(
    "author",
    "username"
  );

  const count = campground.reviews.length;
  const LIMIT = 5;

  let { page, sort } = req.query;
  let sortQuery;
  switch (sort) {
    case "negative":
      sortQuery = { rate: 1 };
      break;
    case "positive":
      sortQuery = { rate: -1 };
      break;
    default:
      sortQuery = {};
      break;
  }

  if (!Number(page) || page * LIMIT > count || page < 0) page = 0;

  const reviews = await Review.find({ _id: { $in: campground.reviews } })
    .sort(sortQuery)
    .populate("author", "username")
    .skip(page * LIMIT)
    .limit(LIMIT);

  const isAuthor =
    req.user && req.user.campgrounds.indexOf(campground._id) !== -1;

  res.render("campground/campground", {
    title: campground.title,
    campground,
    reviews,
    isAuthor,
    currentPage: page,
    countOfPages: count / LIMIT,
  });
});

module.exports.deleteCampground = AsyncWrap(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (campground) {
    const author = await User.findById(campground.author);
    cloudinary.v2.uploader.destroy(
      campground.image.filename,
      function (error, result) {
        if (error) throw AppError(404, "Image not found");
      }
    );
    author.deleteCampgroundById(campground._id);
  } else throw AppError("Campground not found", 404);
  res.redirect("/user");
});

module.exports.editCampground = AsyncWrap(async (req, res, next) => {
  const { title, location, price, description } = req.body;
  const pos = await getPos(location);
  let campground;
  if (req.file) {
    campground = await Campground.findOneAndUpdate(
      { _id: req.params.id },
      {
        title,
        location: { name: location, pos: pos },
        price,
        description,
        image: { url: req.file.path, filename: req.file.filename },
      }
    );
  } else {
    campground = await Campground.findOneAndUpdate(
      { _id: req.params.id },
      {
        title,
        location: { name: location, pos: pos },
        price,
        description,
      }
    );
  }

  if (campground) {
    res.redirect(`/campgrounds/${campground._id}`);
  } else throw AppError("Campground not found", 404);
});

const getPos = require("../utils/getPos");

module.exports.postCampground = AsyncWrap(async (req, res, next) => {
  let campground;
  const { title, location, price, description } = req.body;
  const pos = await getPos(location).catch((err) => {
    req.flash("error", "Adress does not exist");
    return res.redirect("/campgrounds/new");
  });
  try {
    campground = new Campground({
      title,
      location: { name: location, pos: pos },
      price,
      description,
      image: { url: req.file.path, filename: req.file.filename },
    });
    const user = await User.findById(req.user.id);
    await user.postCampground(campground);
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (error) {
    cloudinary.v2.uploader.destroy(
      campground.image.filename,
      function (error, result) {
        if (error) throw new AppError(404, "Image not found");
      }
    );
    req.flash("error", error.message);
    res.redirect("/campgrounds/new");
  }
});
