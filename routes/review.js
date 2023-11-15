const express = require("express");
const { isAuthenticated, isAuthor } = require("../utils/middleware");

const controller = require("../controllers/review");

const router = express.Router({ mergeParams: true });

router.route("/").post(isAuthenticated, controller.postReview);

router.get("/:reviewId/edit", isAuthenticated, controller.renderEditReview);

router
  .route("/:reviewId")
  .patch(isAuthenticated, controller.editReview)
  .delete(isAuthenticated, controller.deleteReview);

module.exports = router;
