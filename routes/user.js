const { isAuthenticated, sanitizeReqBody } = require("../utils/middleware");
const express = require("express");

const router = express.Router();

const controller = require("../controllers/user");

router
  .route("/")
  .get(isAuthenticated, controller.renderUserAuthenticated)
  .patch(isAuthenticated, controller.editUser);

router
  .route("/changePassword")
  .get(isAuthenticated, controller.renderChangePassword)
  .patch(isAuthenticated, controller.changePassword);

router
  .route("/login")
  .get(controller.renderLogin)
  .post(controller.authenticate);

router.get("/edit", isAuthenticated, controller.renderUserEdit);

router
  .route("/register")
  .get(controller.renderRegister)
  .post(controller.registerUser);

router.post("/logout", isAuthenticated, controller.logout);

router
  .route("/:id")
  .get(controller.renderUserById)
  .delete(isAuthenticated, controller.deleteUser);

module.exports = router;
