"use strict";

const User = require("../models/user");
const { mongoose } = require("../configs/dbConnection");

// Django migrate eslenigi, modeldeki degisikliklerin veritabaninina uygulanmasi icin custom bir handler yazilmalidir.

const syncModels = async () => {
  // /* Exampla Data - Run Once */
  // /* CLEAR DATABASE */
  // await mongoose.connection.dropDatabase();
  // console.log("- Database and all data DELETED!");
  // /* MOCK USERS */
  // for (let i in [...Array(200)]) {
  //   User.create({
  //     username: "mock" + String(i),
  //     password: "Qwer1234!",
  //     email: "mock" + String(i) + "@site.com",
  //     isActive: !!(Math.random() < 0.5),
  //     isAdmin: false,
  //     isLead: false,
  //   });
  // }
  // /* CLEAR DATABASE */

  // End:
  console.log("** Synchronized **");
};

module.exports = syncModels;
