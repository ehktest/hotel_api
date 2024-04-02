"use strict";

const router = require("express").Router();
const {
  listRefresh,
  readRefresh,
  listAccess,
  readAccess,
  createRefresh,
  createAccess,
  delRefresh,
  delAccess,
  delUserRefresh,
  delUserAccess,
} = require("../controllers/blacklist");
const { isAdmin } = require("../middlewares/permissions.js");
const idValidation = require("../middlewares/idValidation");

router.use(isAdmin);

router.route("/access").get(listAccess).post(createAccess);
router.route("/refresh").get(listRefresh).post(createRefresh);
router
  .route("/access/:blackAccessId")
  .all(idValidation)
  .get(readAccess)
  .delete(delAccess);
router
  .route("/refresh/:blackRefreshId")
  .all(idValidation)
  .get(readRefresh)
  .delete(delRefresh);
router
  .route("/refresh/user/:blackRefreshUserId")
  .all(idValidation)
  .delete(delUserRefresh);
router
  .route("/access/user/:blackAccessUserId")
  .all(idValidation)
  .delete(delUserAccess);

module.exports = router;
