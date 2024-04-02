"use strict";

const Room = require("../models/room");
const imageUploader = require("../helpers/imageUploader");
const imageDeleter = require("../helpers/imageDeleter");
const truncateErrorUploads = require("../helpers/truncateErrorUploads");
const { fs } = require("../helpers/logFolderCreate");
const { uploadPath } = require("../middlewares/upload");

module.exports = {
  // ? get all
  list: async (req, res) => {
    /*
      #swagger.tags = ["Rooms"]
      #swagger.summary = "List Rooms <Permissions: Public>"
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
    // const data = await Room.find({});
    //* - FILTERING & SEARCHING & SORTING & PAGINATION *//
    // ! middleware ile response'a eklenen getModelList async function'ina model girilerek filter, search, sort, pagination yaptirilabilir dilenen controller method'unda.
    const data = await res.getModelList(Room);

    // ! pagination detail'leri icin middleware'e eklenmis ekstra async function ile pagination detail'leri response ile donulebilir, bu frontend pagination icin oldukca elverislidir, ekstra hic bir package/logic kullanmaya gerek kalmaz.
    res.status(200).json({
      error: false,
      details: await res.getModelListDetails(Room),
      result: data,
    });
  },
  // ? get single
  read: async (req, res) => {
    /*
      #swagger.tags = ["Rooms"]
      #swagger.summary = "Get Single Room <Permissions: Public>"
    */
    const data = await Room.findById(req.params.roomId);

    res.status(200).json({
      error: false,
      result: data,
    });
  },
  // ? create
  create: async (req, res, next) => {
    /*
      #swagger.tags = ['Rooms']
      #swagger.summary = 'Create a new Room <Permissions: Admin>'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          room_number: 100,
          images: ['uploads/default_hotel_room_pic.png'],
          bed_type: 'Twin',
          price: 250, 
        }
      }
    */
    // if files uploaded, add them to the body
    try {
      const newImages = await imageUploader(req, Room, { next });
      if (typeof newImages === "function") {
        return newImages;
      }

      const data = await Room.create(req.body);
      res.status(201).json({
        error: false,
        result: data,
      });
      // Log dosyasını temizle
      fs.truncateSync(uploadPath); // Log dosyasını senkron olarak temizle
    } catch (error) {
      // Hata olustugunda yuklenmis dosyalari ve loglari temizle
      truncateErrorUploads();

      if (error.code === 11000) {
        return res.status(400).json({
          error: true,
          message: "Room number already exists.",
        });
      }

      res.status(500).json({
        error: true,
        message: error.message || "An error occurred while updating the room.",
      });
    }
  },
  // ? update
  update: async (req, res, next) => {
    /*
      #swagger.tags = ['Rooms']
      #swagger.summary = 'Update Room <Permissions: Admin>'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          room_number: 900,
          images: ['uploads/default_hotel_room_pic.png'],
          bed_type: 'King',
          price: 350,  
        }
      }
    */

    try {
      // if files uploaded, delete old ones first
      const delImages = await imageDeleter(req, Room, { next });
      if (typeof delImages === "function") {
        return delImages;
      }
      // if files uploaded, add them to the body
      const upImages = await imageUploader(req, Room, { next, update: true });
      if (typeof upImages === "function") {
        return upImages;
      }

      const data = await Room.findByIdAndUpdate(req.params.roomId, req.body, {
        runValidators: true,
        new: true,
      }); // default olarak bulunani doner, update edilmis halini degil. new:true ile update edilmis halini doner.

      // 202 -> accecpted
      res.status(202).json({
        error: false,
        message: "Updated",
        body: req.body, // gonderilen veriyi goster
        // result: await Room.findById(req.params.roomId), // guncellenmis veriyi goster
        result: data, // guncellenmis veriyi goster
      });
      // Log dosyasını temizle
      fs.truncateSync(uploadPath); // Log dosyasını senkron olarak temizle
    } catch (error) {
      // Hata olustugunda yuklenmis dosyalari ve loglari temizle
      truncateErrorUploads();

      if (error.code === 11000) {
        return res.status(400).json({
          error: true,
          message: "Room number already exists.",
        });
      }

      res.status(500).json({
        error: true,
        message: error.message || "An error occurred while updating the room.",
      });
    }
  },

  // ? delete
  destroy: async (req, res, next) => {
    /*
      #swagger.tags = ["Rooms"]
      #swagger.summary = "Delete Room <Permissions: Admin>"
    */

    const delImages = await imageDeleter(req, Room, { next });
    if (typeof delImages === "function") {
      return delImages;
    }

    const data = await Room.deleteOne({
      _id: req.params.roomId,
    });

    if (!data.deletedCount) throw new CustomError("Not deleted", 409); // 409 Conflict
    // res.status(200).json({
    res.status(204).json({
      error: false,
      result: data,
    });
  },
};
