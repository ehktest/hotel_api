"use strict";

require("dotenv").config();
const { AccessBlacklist, RefreshBlacklist } = require("../models/blacklist");

module.exports = async () => {
  const deleteDate = new Date();
  // setDate negatif cikarsa otomatik olarak ilgili tarihi baz alarak bir onceki aya gecer.
  deleteDate.setDate(
    deleteDate.getDate() - Number(process.env?.REFRESH_EXP.replaceAll("d", ""))
  );

  await AccessBlacklist.deleteMany({ createdAt: { $lt: deleteDate } })
    .then((dels) => {
      console.log(`${dels.deletedCount} access blacklist tokens deleted.`);
    })
    .catch((error) => {
      console.error(
        "An error occured on deleting access blacklist tokens:",
        error
      );
    });

  await RefreshBlacklist.deleteMany({ createdAt: { $lt: deleteDate } })
    .then((dels) => {
      console.log(`${dels.deletedCount} refresh blacklist tokens deleted.`);
    })
    .catch((error) => {
      console.error(
        "An error occured on deleting refresh blacklist tokens:",
        error
      );
    });
};
