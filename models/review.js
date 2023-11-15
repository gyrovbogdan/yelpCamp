const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true],
    },
    campground: { type: Schema.Types.ObjectId, ref: "Campground" },
    text: {
      type: String,
      required: [true, "Campground must have a description"],
      minLength: [5, "The description must be longer than 5 characters"],
      maxLength: [500, "The description must be less than 500 characters long"],
      trim: true,
    },
    rate: {
      type: Number,
      required: [true, "Review must have a rating"],
      min: [1, "The rating cannot be less than zero"],
      max: [5, "The rating cannot be more than 5"],
    },
  },
  { timestamps: true }
);

ReviewSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true;
  next();
});

module.exports = mongoose.model("Review", ReviewSchema);
