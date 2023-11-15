const mongoose = require("mongoose");

const Campground = require("../models/campground"),
  User = require("../models/user"),
  Review = require("../models/review");

const { descriptors, places, cities } = require("./seedHelpers");
const axios = require("axios");
const getPos = require("../utils/getPos");

const dbUrl = process.env.DB_URL;
const unsplash_key = process.env.UNSPLASH_API_KEY;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("   Connected to MongoDB");
  })
  .catch((err) => console.log("ERROR: ", err));

const randInt = (min, max) => Math.floor(Math.random() * max) + min;

const plantSeeds = async () => {
  // await User.deleteMany({});
  //await Campground.deleteMany({});
  //await Review.deleteMany({});

  for (let i = 0; i < 20; i++) {
    let words = await axios
      .get("https://random-word-api.vercel.app/api?words=2")
      .then((res) => res.data);

    const image = await axios
      .get(
        `https://api.unsplash.com/photos/random?client_id=${unsplash_key}&collection=3293100`
      )
      .then((res) => res.data.urls.regular);

    let user = new User({
      username: `${words[0]}${words[1]}`,
      email: `${words[0]}${words[1]}@gmail.com`,
    });

    user = await User.register(user, "admin");

    const description = descriptors[randInt(0, descriptors.length)];
    const place = places[randInt(0, places.length)];
    const location = cities[randInt(0, cities.length)].city;

    const campground = await Campground({
      title: description + " " + place,
      location: { name: location, pos: await getPos(location) },
      price: randInt(10, 150),
      description: `${description} ${place} in ${location}`,
      image: { url: image, filename: "none" },
    });

    await user.postCampground(campground);
  }

  console.log("   End");

  mongoose.connection.close();
};

plantSeeds();
