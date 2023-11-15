if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");

const methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  ejsMate = require("ejs-mate"),
  morgan = require("morgan"),
  path = require("path"),
  flash = require("express-flash"),
  session = require("express-session"),
  MongoStore = require("connect-mongo"),
  passport = require("passport"),
  mongoSanitize = require("express-mongo-sanitize"),
  helmet = require("helmet");

const User = require("./models/user");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const { ErrorHandler } = require("./utils/middleware");

const homeRouter = require("./routes/home"),
  campgroundRoutes = require("./routes/campground"),
  userRoutes = require("./routes/user"),
  reviewRoutes = require("./routes/review"),
  notFoundRouter = require("./routes/notFoundRouter");

const { localsMiddleware } = require("./utils/middleware");

const mongoose = require("mongoose");

const dbUrl = process.env.DB_URL;
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("   Connected to MongoDB");
  })
  .catch((err) => console.log("ERROR: ", err));

const app = express();

app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",

  "https://api-maps.yandex.ru/",
  "https://geocode-maps.yandex.ru/",
  "https://yastatic.net/",
  "https://core-renderer-tiles.maps.yandex.net/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",

  "https://api-maps.yandex.ru/",
  "https://geocode-maps.yandex.ru/",
  "https://yastatic.net/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",

  "https://api-maps.yandex.ru/",
  "https://geocode-maps.yandex.ru/",
  "https://yastatic.net/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://api-maps.yandex.ru/",
        "https://core-renderer-tiles.maps.yandex.net/",
        "https://yandex.ru/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/yelpcamp",
    touchAfter: 24 * 3600,
  }),
  secret: "thisshouldbeabettersecret!",
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("tiny"));

app.use(methodOverride("_method"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(mongoSanitize()); // Remove '.' and '$' from user input

app.use(localsMiddleware);

// routes
app.use("/", homeRouter);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/user", userRoutes);
app.use(notFoundRouter);
//

app.use(ErrorHandler);

app.listen(3000, () => {
  console.log("Servering on port 3000: ");
});
