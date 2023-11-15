const mongoose = require("mongoose");
require("mongoose-type-url");
const { Schema } = mongoose;
const Review = require("./review");
const cloudinary = require("cloudinary");

const CampgroundSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Campground must have a title"],
      trim: true,
    },
    location: {
      name: {
        type: String,
        required: [true, "Campground must have a location"],
        trim: true,
      },

      pos: [Number, Number],
    },
    price: {
      type: Number,
      min: [1, "The price must be greater than zero"],
      max: [100000000, "Too many numbers"],
      required: [true, "Campground must have a price"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Campground must have a description"],
      minLength: [5, "The description must be longer than 5 characters"],
      maxLength: [500, "The description must be less than 500 characters long"],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Campground must have a rating"],
      default: 0,
      min: [0, "The rating cannot be negative"],
      max: [5, "The rating cannot be more than 5"],
    },
    image: {
      url: {
        type: mongoose.SchemaTypes.Url,
        required: [true, "Campground must have an image"],
      },
      filename: {
        type: String,
        required: [true, "Campground must have an image"],
      },
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

CampgroundSchema.virtual("reviewsLength").get(function () {
  return this.reviews.length;
});

CampgroundSchema.pre("findOneAndUpdate", async function (next) {
  this.options.runValidators = true;

  const campground = await this.model.findOne(this.getQuery());
  cloudinary.v2.uploader.destroy(
    campground.image.filename,
    function (error, result) {}
  );
  next();
});

CampgroundSchema.methods.recalculateRating =
  async function recalculateRating() {
    let summ = 0;

    const reviews = await Review.find({ _id: { $in: this.reviews } });

    if (reviews.length === 0) this.rating = 0;
    else {
      for (const review of reviews) summ += review.rate;
      this.rating = summ / reviews.length;
    }

    await this.save();
  };

CampgroundSchema.methods.pushReview = async function pushReview(review) {
  review.campground = this;
  await review.save();

  this.reviews.push(review);
  await this.recalculateRating();
};

CampgroundSchema.methods.editReviewById = async function pushReview(
  reviewId,
  changes
) {
  await Review.findOneAndUpdate({ _id: reviewId }, changes);
  await this.recalculateRating();
};

CampgroundSchema.methods.deleteReviewById = async function deleteReviewById(
  reviewId
) {
  if (this.reviews.includes(reviewId)) {
    this.reviews.splice(this.reviews.indexOf(reviewId), 1);
    await this.save();
  }
  await Review.findByIdAndDelete(reviewId);
  await this.recalculateRating();
};

module.exports = mongoose.model("Campground", CampgroundSchema);
