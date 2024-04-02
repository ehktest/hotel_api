"use strict";
const router = require("express").Router();

const Room = require("../controllers/room");
const idValidation = require("../middlewares/idValidation");
const { isAdmin } = require("../middlewares/permissions");
// * multer package'i ile multipart/form-data verileri parse edilebilir.
const { upload } = require("../middlewares/upload");

// ! swagger route regex'lerle saglikli calismamaktadir. orn: (\\w+). idValidation middleware'i varsa kullanilmayabilir.
router
  .route("/:roomId")
  .all(idValidation)
  // ? get single
  .get(Room.read) // AllowAny
  // ? update
  .put(isAdmin, upload.array("images", 5), Room.update)
  .patch(isAdmin, upload.array("images", 5), Room.update)
  // ? delete
  .delete(isAdmin, Room.destroy);

router
  .route("/")
  // ? get all
  .get(Room.list) // AllowAny
  // ? create
  .post(isAdmin, upload.array("images", 5), Room.create);

module.exports = router;
