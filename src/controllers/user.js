"use strict";

require("express-async-errors");

const User = require("../models/user");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const { getUser } = require("../middlewares/permissions");

module.exports = {
  list: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "List Users <Permissions: Admin>"
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
    const data = await res.getModelList(User);

    res.status(200).json({
      error: false,
      details: await res.getModelListDetails(User),
      result: data,
    });
  },

  read: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Get Single User <Permissions: Admin|Own>"
    */
    const user = getUser(req);
    // ? admin degilse yalnizca kendi user kaydini goruntuleyebilir
    let filter = {};
    if (!user.isAdmin) {
      filter = { _id: user?.id };
    }

    const data = await User.findOne({ _id: req.params.userId, ...filter });

    res.status(200).json({
      error: false,
      result: data,
    });
  },

  create: async (req, res, next) => {
    /*
      #swagger.tags = ['Users']
      #swagger.summary = 'Create a new User <Permissions: Public>'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          email:'user@example.com',
          password: 'Qwer1234!',
          username: 'uniqueusername',
          // isActive: true, 
          isAdmin: false, 
        }
      }
    */

    // * admin yalnizca bir tane olur
    if (req.body?.isAdmin) {
      delete req.body?.isAdmin;
    }

    // * user olusturulurken daima active olur
    delete req.body?.isActive;

    const data = await User.create(req.body);

    // * sendMail(to, subject, message)
    // sendMail(
    //   data.email,
    //   "Welcome",
    //   `<h1>Welcome ${data.username}!</h1><p>Welcome to our system</p>`
    // );

    res.status(201).json({
      error: false,
      result: data,
    });
  },

  update: async (req, res) => {
    /*
      #swagger.tags = ['Users']
      #swagger.summary = 'Update User <Permissions: Admin|Own>'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          email:'newuser@example.com',
          password: 'Qwer4321!',
          username: 'newuniqueusername',
          isActive: true, 
          isAdmin: false, 
        }
      }
    */

    const user = getUser(req);
    // ? admin degilse yalnizca kendi user kaydini goruntuleyebilir ve kendi kaydinda belirli alanlari degistiremez
    let filter = {};
    if (!user?.isAdmin) {
      delete req.body?.isAdmin;
      delete req.body?.isActive;
      filter = { _id: user?.id };
    }

    const data = await User.findOneAndUpdate(
      { _id: req.params.userId, ...filter },
      req.body,
      { runValidators: true, new: true }
    );

    res.status(202).json({
      error: false,
      message: "Updated",
      body: req.body,

      result: data,
    });
  },

  destroy: async (req, res) => {
    /*
      #swagger.tags = ["Users"]
      #swagger.summary = "Delete User <Permissions: Admin>"
    */

    const data = await User.deleteOne({ _id: req.params.userId });

    if (!data.deletedCount) throw new CustomError("Not deleted", 409);

    res.status(204).json({
      error: false,
      result: data,
    });
  },
};
