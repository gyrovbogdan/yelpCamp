const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const validator = require("validator");
const Campground = require("./campground");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "User must have an email"],
      validate: [validator.isEmail, "Invalid Email"],
      trim: true,
    },
    campgrounds: [{ type: Schema.Types.ObjectId, ref: "Campground" }],
  },
  { timestamps: true }
);

UserSchema.plugin(passportLocalMongoose);

UserSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true;
  next();
});

UserSchema.post("findOneAndDelete", async (user, next) => {
  await Campground.deleteMany({ _id: { $in: user.campgrounds } });
  next();
});

UserSchema.methods.postCampground = async function postCampground(campground) {
  campground.author = this;
  await campground.save();
  this.campgrounds.push(campground);
  await this.save();
};

UserSchema.methods.deleteCampgroundById = async function deleteCampgroundById(
  campgroundId
) {
  const updatedList = this.campgrounds.filter((el) => !el.equals(campgroundId));
  this.campgrounds = updatedList;
  await Campground.findByIdAndDelete(campgroundId);
  await this.save();
};

module.exports = mongoose.model("User", UserSchema);
