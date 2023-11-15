const express = require("express");
const {
  isAuthenticated,
  isAuthor,
  sanitizeReqBody,
} = require("../utils/middleware");

const { storage } = require("../storage/storage"),
  multer = require("multer"),
  upload = multer({ storage });

const controller = require("../controllers/campground");

const router = express.Router();

router
  .route("/")
  .get(controller.renderCampgrounds)
  .post(
    isAuthenticated,
    upload.single("image"),
    sanitizeReqBody,
    controller.postCampground
  );

router.get("/new", isAuthenticated, controller.renderNewCampground);

router.get(
  "/:id/edit",
  isAuthenticated,
  isAuthor,
  controller.renderEditCampground
);

router
  .route("/:id")
  .delete(isAuthenticated, isAuthor, controller.deleteCampground)
  .patch(
    isAuthenticated,
    isAuthor,
    upload.single("image"),
    sanitizeReqBody,
    controller.editCampground
  )
  .get(controller.renderCampground);

module.exports = router;
