"use strict";
const router = require("express").Router();

const User = require("../controllers/user");
const idValidation = require("../middlewares/idValidation");
const permissions = require("../middlewares/permissions");

router
  .route("/:userId")
  .all(idValidation)
  // ? get single
  .get(permissions.isAdminOrOwn, User.read)
  // ? update
  .put(permissions.isAdminOrOwn, User.update)
  .patch(permissions.isAdminOrOwn, User.update)
  // ? delete
  .delete(permissions.isAdmin, User.destroy);

router
  .route("/")
  // ? get all
  .get(permissions.isAdmin, User.list)
  // ? create
  .post(User.create); // AllowAny

module.exports = router;
