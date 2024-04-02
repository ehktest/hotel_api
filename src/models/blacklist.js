"use strict";

const { mongoose } = require("../configs/dbConnection");
const { Schema, model, models } = mongoose;

const AccessBlacklistSchema = Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, // ForeignKey, RelationID
      ref: "User", // ref'teki model adi -> mongoose.model('modelName',fromWhichSchema)'deki modelName ile ayni olmak zorundadir.
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
  },
  {
    collection: "access-blacklist",
    timestamps: {
      currentTime: () => {
        let date = new Date();
        let newDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60 * 1000
        );
        return newDate;
      },
    },
  }
);

const RefreshBlacklistSchema = Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, // ForeignKey, RelationID
      ref: "User", // ref'teki model adi -> mongoose.model('modelName',fromWhichSchema)'deki modelName ile ayni olmak zorundadir.
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    collection: "refresh-blacklist",
    // convert UTC0 timestamps to locale UTC
    timestamps: {
      currentTime: () => {
        let date = new Date();
        let newDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60 * 1000
        );
        return newDate;
      },
    },
  }
);

module.exports = {
  AccessBlacklist:
    models.AccessBlacklist || model("AccessBlacklist", AccessBlacklistSchema),
  RefreshBlacklist:
    models.RefreshBlacklist ||
    model("RefreshBlacklist", RefreshBlacklistSchema),
};
