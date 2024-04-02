"use strict";
const router = require("express").Router();

const Auth = require("../controllers/auth");

router
  .post("/login", Auth.login)
  .get("/refresh_browsers", Auth.refresh_browsers) // refresh token cookie ile iletiliyor
  .get("/refresh_others", Auth.refresh_others) // refresh token json response ile iletiliyor
  .get("/logout", Auth.logout);
// ! swagger all method'unu desteklemez

module.exports = router;
