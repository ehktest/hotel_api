"use strict";

const CustomError = require("../errors/customError");
const { AccessBlacklist, RefreshBlacklist } = require("../models/blacklist");

// ? blacklist token'lari admin user ile API'den handle edilebilecektir
module.exports = {
  listRefresh: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const allRefresh = await res.getModelList(RefreshBlacklist, {}, "userId");

    res.status(200).json({
      error: false,
      details: await res.getModelListDetails(RefreshBlacklist),
      result: allRefresh,
    });
  },
  readRefresh: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const blackRefreshId = req.params.blackRefreshId;
    const blackRefresh = await RefreshBlacklist.findById(
      blackRefreshId
    ).populate("userId");

    res.status(200).json({
      error: false,
      result: blackRefresh,
    });
  },
  listAccess: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const allAccess = await res.getModelList(AccessBlacklist, {}, "userId");

    res.status(200).json({
      error: false,
      details: await res.getModelListDetails(AccessBlacklist),
      result: allAccess,
    });
  },
  readAccess: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const blackAccessId = req.params.blackAccessId;
    const blackAccess = await AccessBlacklist.findById(blackAccessId).populate(
      "userId"
    );

    res.status(200).json({
      error: false,
      result: blackAccess,
    });
  },
  createRefresh: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const newBlackRefresh = await RefreshBlacklist.create(req.body);

    res.status(201).json({
      error: false,
      result: newBlackRefresh,
    });
  },
  createAccess: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const newBlackAccess = await AccessBlacklist.create(req.body);

    res.status(201).json({
      error: false,
      result: newBlackAccess,
    });
  },
  delRefresh: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const blackRefreshId = req.params.blackRefreshId;
    const deletedBlackRefresh = await RefreshBlacklist.deleteOne({
      _id: blackRefreshId,
    });

    if (!deletedBlackRefresh.deletedCount)
      throw new CustomError("Not deleted", 409); // 409 Conflict
    res.status(204).json({
      error: false,
      result: deletedBlackRefresh,
    });
  },
  delAccess: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const blackAccessId = req.params.blackAccessId;
    const deletedBlackAccess = await AccessBlacklist.deleteOne({
      _id: blackAccessId,
    });

    if (!deletedBlackAccess.deletedCount)
      throw new CustomError("Not deleted", 409); // 409 Conflict
    res.status(204).json({
      error: false,
      result: deletedBlackAccess,
    });
  },
  delUserRefresh: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const blackRefreshUserId = req.params.blackRefreshUserId;
    const delUsersAllBlackRefresh = await RefreshBlacklist.deleteMany({
      userId: blackRefreshUserId,
    });

    if (!delUsersAllBlackRefresh.deletedCount)
      throw new CustomError("Not deleted", 409); // 409 Conflict

    res.status(204).json({
      error: false,
      result: delUsersAllBlackRefresh,
    });
  },
  delUserAccess: async (req, res) => {
    /*
      #swagger.ignore = true
    */
    const blackAccessUserId = req.params.blackAccessUserId;
    const delUsersAllBlackAccess = await AccessBlacklist.deleteMany({
      userId: blackAccessUserId,
    });

    if (!delUsersAllBlackAccess.deletedCount)
      throw new CustomError("Not deleted", 409); // 409 Conflict

    res.status(204).json({
      error: false,
      result: delUsersAllBlackAccess,
    });
  },
};
