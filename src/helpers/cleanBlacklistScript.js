"use strict";

require("dotenv").config();
const {
  AccessBlacklist,
  RefreshBlacklist,
  cleanBlacklist,
} = require("../helpers/cleanBlacklist");

(async () => {
  const { connectDB } = require("../configs/dbConnection");
  await connectDB();

  await cleanBlacklist();
})();
