"use strict";

const Reservation = require("../models/reservation");
const Room = require("../models/room");
const reservationChecker = require("../helpers/reservationChecker");
const nightCalculator = require("../helpers/nightCalculator");
const utcDateGenerator = require("../helpers/utcDateGenerator");
const { getUser } = require("../middlewares/permissions");

module.exports = {
  // ? get all
  list: async (req, res) => {
    // ! _swagger.tagName = true -> atamayi gormezden gelir
    /*
      #swagger.tags = ["Reservations"]
      #swagger.summary = "List Reservations <Permissions: Login>"
      #swagger.description = `
          You can send query with endpoint for filter[], search[], sort[], page and limit.
          <ul> Examples:
              <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
              <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
              <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
              <li>URL/?<b>page=2&limit=1</b></li>
          </ul>
      `
    */
    // ? admin degilse yalnizca kendi reservation kayitlarini goruntuleyebilir
    const user = getUser(req);
    let filter = {};
    if (!user.isAdmin) {
      filter = { userId: user?.id };
    }

    //* - FILTERING & SEARCHING & SORTING & PAGINATION *//
    // ! middleware ile response'a eklenen getModelList async function'ina model girilerek filter, search, sort, pagination yaptirilabilir dilenen controller method'unda.
    const data = await res.getModelList(Reservation, filter, [
      "userId",
      "roomId",
    ]);

    // ! pagination detail'leri icin middleware'e eklenmis ekstra async function ile pagination detail'leri response ile donulebilir, bu frontend pagination icin oldukca elverislidir, ekstra hic bir package/logic kullanmaya gerek kalmaz.
    res.status(200).json({
      error: false,
      details: await res.getModelListDetails(Reservation, filter),
      result: data,
    });
  },
  // ? get single
  read: async (req, res) => {
    /*
      #swagger.tags = ["Reservations"]
      #swagger.summary = "Get Single Reservation <Permissions: Login>"
    */
    // ? admin degilse yalnizca kendi reservation kaydini goruntuleyebilir
    const user = getUser(req);
    let filter = {};
    if (!user.isAdmin) {
      filter = { userId: user?.id };
    }

    const data = await Reservation.findOne({
      _id: req.params.reservationId,
      ...filter,
    }).populate(["userId", "roomId"]);

    res.status(200).json({
      error: false,
      result: data,
    });
  },

  // ? create
  create: async (req, res) => {
    /*
      #swagger.tags = ['Reservations']
      #swagger.summary = 'Create a new Reservation <Permissions: Login>'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          userId: "6604949d45251ddc39dfef17",
          roomId: "660202563031a220de52435d",
          arrival_date: "2024-03-30T13:00:00.000Z",
          departure_date: "2024-03-31T06:00:00.000Z",
          guest_number: 1,
          night: 1,
          price: 250, 
          total_price: 250,
        }
      }
    */

    // * req.body date field'larini absolute ISO 8601'e cevir
    req.body.arrival_date = utcDateGenerator(req.body, "arrival_date");
    req.body.departure_date = utcDateGenerator(req.body, "departure_date");

    // * ayni oda icin diger rezervasyon tarih araliklarinin cakisip cakismadigini kontrol et
    if (await reservationChecker(Reservation, req)) {
      res.status(400).json({
        error: true,
        message: "This room is already reserved for the given dates.",
      });
    } else {
      // * req.body.userId'yi request'i yapan user ile override et
      const user = getUser(req);
      req.body.userId = user?.id;

      const data = await Reservation.create(req.body);
      res.status(201).json({
        error: false,
        result: data,
      });
    }
  },

  // ? update
  update: async (req, res) => {
    /*
      #swagger.tags = ['Reservations']
      #swagger.summary = 'Update Reservation <Permissions: Admin>'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          userId: "6604949d45251ddc39dfef17",
          roomId: "660202563031a220de52435d",
          arrival_date: "2024-04-30T13:00:00.000Z",
          departure_date: "2024-04-31T06:00:00.000Z",
          guest_number: 2,
          night: 3,
          price: 350, 
          total_price: 1050,
        }
      }
    */

    // * req.body date field'larini absolute ISO 8601'e cevir
    if (req.body?.arrival_date)
      req.body.arrival_date = utcDateGenerator(req.body, "arrival_date");
    if (req.body?.departure_date)
      req.body.departure_date = utcDateGenerator(req.body, "departure_date");

    // * ayni oda icin diger rezervasyon tarih araliklarinin cakisip cakismadigini kontrol et
    if (await reservationChecker(Reservation, req)) {
      res.status(400).json({
        error: true,
        message: "This room is already reserved for the given dates.",
      });
    } else {
      // Güncellenmek istenen reservation'in mevcut bilgilerini al.
      // Belgeyi bul
      const reservation = await Reservation.findById(req.params.reservationId);
      if (!reservation) {
        // Belge bulunamadıysa hata döndür
        return res.status(404).json({
          error: true,
          message: "Reservation not found",
        });
      }

      // * req.body.userId'yi request'i yapan user ile override et
      const user = getUser(req);
      req.body.userId = user?.id;

      // Schema'da tanımlı alanları al
      // https://mongoosejs.com/docs/api/schema.html#Schema.prototype.paths
      // The paths defined on this schema. The keys are the top-level paths in this schema, and the values are instances of the SchemaType class.
      // const schema = new Schema({ name: String }, { _id: false });
      // schema.paths; // { name: SchemaString { ... } }
      const schemaKeys = Object.keys(Reservation.schema.paths);

      // req.body içindeki key'leri döngü ile işle
      Object.keys(req.body).forEach((key) => {
        // Eğer key schema'da varsa, document değerini güncelle
        if (schemaKeys.includes(key)) {
          reservation[key] = req.body[key];
        }
      });

      // Document'i kaydet
      // const updatedDoc = await reservation.save();

      // Güncellenmiş document'i döndür
      // 202 -> accecpted
      res.status(202).json({
        error: false,
        message: "Updated",
        body: req.body, // gonderilen veriyi goster
        // result: await Reservation.findById(req.params.reservationId), // guncellenmis veriyi goster
        result: await reservation.save(), // guncellenmis veriyi goster
      });
    }
  },
  // ? delete
  destroy: async (req, res) => {
    /*
      #swagger.tags = ["Reservations"]
      #swagger.summary = "Delete Reservation <Permissions: Admin>"
    */
    const data = await Reservation.deleteOne({
      _id: req.params.reservationId,
    });

    if (!data.deletedCount) throw new CustomError("Not deleted", 409); // 409 Conflict
    // res.status(200).json({
    res.status(204).json({
      error: false,
      result: data,
    });
  },
};
