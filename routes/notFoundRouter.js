const express = require("express");
const AppError = require("../utils/AppError");

const router = express.Router();

/* router.use("*", (req, res, next) => {
  next(new AppError("Page Not Found", 404));
});
 */
module.exports = router;
