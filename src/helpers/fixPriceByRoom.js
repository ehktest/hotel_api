"use strict";

const { mongoose } = require("../configs/dbConnection");

module.exports = async function (next) {
  const room = await mongoose.model("Room").findById(this.roomId);
  if (room) {
    // Yatak tipine gore ilave ucret
    let additionalCost = 0;
    if (room.bed_type === "Twin") additionalCost += 50;
    if (room.bed_type === "King") additionalCost += 100;
    // Oda fiyatını rezervasyon fiyatına ata
    this.price = room.price + additionalCost;
  } else {
    return next(new Error("Room not found"));
  }
};
