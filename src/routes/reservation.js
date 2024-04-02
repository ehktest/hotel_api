"use strict";
const router = require("express").Router();

const Reservation = require("../controllers/reservation");
const idValidation = require("../middlewares/idValidation");
const permissions = require("../middlewares/permissions");

// ! swagger route regex'lerle saglikli calismamaktadir. orn: (\\w+). idValidation middleware'i varsa kullanilmayabilir.
router
  .route("/:reservationId")
  .all(idValidation)
  // ? get single
  .get(permissions.isLogin, Reservation.read)
  // ? update
  .put(permissions.isAdmin, Reservation.update)
  .patch(permissions.isAdmin, Reservation.update)
  // ? delete
  .delete(permissions.isAdmin, Reservation.destroy);

router
  .route("/")
  // ? get all
  .get(permissions.isLogin, Reservation.list)
  // ? create
  .post(permissions.isLogin, Reservation.create);

module.exports = router;
