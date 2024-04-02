"use strict";

const mongoose = require("mongoose");

let CLUSTER, DATABASE;
if (process.env.NODE_ENV !== "production") {
  CLUSTER = "mongodb://localhost:27017/";
  DATABASE = process.env?.DATABASE_NAME || "HotelAPI";
} else {
  CLUSTER = process.env?.DATABASE_URI;
  DATABASE = "";
}

const connectDB = async () => {
  try {
    // database name, cluster'da mevcut olmasa bile collection'larda oldugu gibi otomatik olusturur.
    await mongoose.connect(`${CLUSTER}${DATABASE}`);
    console.log(`*** DB${DATABASE && " " + DATABASE} Connected ***`);
  } catch (err) {
    console.log(`*** DB${DATABASE && " " + DATABASE} Connection Error ***`);
    console.error(err);
  }
};

module.exports = { mongoose, connectDB };
