"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Schema, model, models } = mongoose;
const nightCalculator = require("../helpers/nightCalculator");
const fixPriceByRoom = require("../helpers/fixPriceByRoom");

const ReservationSchema = new Schema(
  {
    // Many-to-one -> one user can have many reservations
    userId: {
      type: Schema.Types.ObjectId, // ForeignKey, RelationID
      ref: "User", // ref'teki model adi -> mongoose.model('modelName',fromWhichSchema)'deki modelName ile ayni olmak zorundadir.
      required: true,
    },
    // Many-to-one -> one room can have many reservations
    roomId: {
      type: Schema.Types.ObjectId, // ForeignKey, RelationID
      ref: "Room", // ref'teki model adi -> mongoose.model('modelName',fromWhichSchema)'deki modelName ile ayni olmak zorundadir.
      required: true,
    },
    arrival_date: {
      type: Date,
      required: true,
      validate: [
        function (arrDate) {
          // 12 saat, ms cinsinden
          const twelveHoursInMilliseconds = 12 * 60 * 60 * 1000;
          // su anki zaman
          const now = new Date();
          // girilen arrival date
          const arrivalDate = new Date(arrDate);
          // su an ki zamandan 12 saat sonrasindan once rezervasyon olusturmaya izin verme
          const isAllowed = arrivalDate - now >= twelveHoursInMilliseconds;
          return isAllowed;
        },
        "You can create reservations minimum 12 hours later than current time!",
      ],
    },
    departure_date: {
      type: Date,
      required: true,
      validate: [
        function (deptDate) {
          // 12 saat, ms cinsinden
          const twelveHoursInMilliseconds = 12 * 60 * 60 * 1000;
          // su anki zaman
          const now = new Date();
          // girilen arrival date
          const arrivalDate = new Date(this.arrival_date);
          // girilen departure date
          const departureDate = new Date(deptDate);
          // departure_date ve arrival_date arasindaki fark uygun mu
          const isValidDuration =
            departureDate - arrivalDate >= twelveHoursInMilliseconds;
          return isValidDuration;
        },
        "The difference between arrival and departure dates must be at least 12 hours!",
      ],
    },
    guest_number: {
      type: Number,
      required: true,
      validate: [
        (guest_number) => guest_number <= 3,
        "A reservation for a room can be for 3 people at most",
      ],
    },
    night: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "reservation",
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

// ! create ile veya find query'leriyle cekip update edip save yapildiginda calisir.
ReservationSchema.pre("save", async function (next) {
  // Eger 'roomId' alani degismisse veya yeni bir rezervasyon olusturuluyorsa room price'i price'a ata
  if (this.isModified("roomId") || this.isNew) {
    await fixPriceByRoom.call(this, next);
  }

  // Cikis saatine gore gecelik hesaplama
  if (
    this.isModified("night") ||
    this.isModified("arrival_date") ||
    this.isModified("departure_date")
  ) {
    nightCalculator(this);
  }

  // Eger fiyat, toplam fiyat veya gece sayisi degismisse, toplam fiyatı guncelle
  if (
    this.isModified("price") ||
    this.isModified("total_price") ||
    this.isModified("night")
  ) {
    await fixPriceByRoom.call(this, next);
    this.total_price = this.price * this.night;
  }

  next();
});

module.exports = models?.Reservation || model("Reservation", ReservationSchema);
