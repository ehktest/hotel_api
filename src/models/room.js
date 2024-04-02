"use strict";

const { mongoose } = require("../configs/dbConnection");
const { Schema, model, models } = mongoose;

const RoomSchema = new Schema(
  {
    room_number: {
      type: Number,
      required: true,
      unique: true,
    },
    images: {
      type: [String],
      default: ["/uploads/default_hotel_room_pic.png"],
    },
    bed_type: {
      type: String,
      enum: ["Single", "Twin", "King"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "room",
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

module.exports = models?.Room || model("Room", RoomSchema);
