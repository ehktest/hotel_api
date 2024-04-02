"use strict";

const { AccessBlacklist, RefreshBlacklist } = require("../models/blacklist");
const jwt = require("jsonwebtoken");

const userIdGetter = (req, accessToken) => {
  let userId;
  if (req?.userAPI) {
    userId = req.userAPI?.id;
  }

  if (!userId) {
    jwt.verify(
      accessToken,
      process.env.ACCESS_KEY,
      async (error, decodedAccessData) => {
        if (decodedAccessData) {
          userId = decodedAccessData.id;
        }
      }
    );
  }

  return userId;
};

module.exports = {
  // ? Authentication Check
  isAccessAPIBlacklisted: async (accessToken) => {
    const isBlacklisted = await AccessBlacklist.findOne({ accessToken });
    return !!isBlacklisted;
  },
  isAccessCookieBlacklisted: async (req) => {
    const accessToken = req.session?.accessToken;
    if (!accessToken) throw new Error("Access token not found on cookie.");
    const isBlacklisted = await AccessBlacklist.findOne({ accessToken });
    if (isBlacklisted) req.session = null;
    return !!isBlacklisted;
  },
  // ? Refresh Check
  isRefreshAPIBlacklisted: async (req, accessToken, refreshToken) => {
    const isBlacklisted = await RefreshBlacklist.findOne({ refreshToken });
    // blacklist'te yoksa yeni access token almadan once mevcut olani blacklist'e al, varsa guncelle yoksa ekle
    const userId = userIdGetter(req, accessToken);
    if (!isBlacklisted)
      await AccessBlacklist.findOneAndUpdate(
        { userId, accessToken },
        { userId, accessToken },
        { upsert: true, new: true }
      );
    return !!isBlacklisted;
  },
  isRefreshCookieBlacklisted: async (req) => {
    const refreshToken = req.session?.refreshToken;
    if (!refreshToken) throw new Error("Refresh token not found on cookie.");
    const isBlacklisted = await RefreshBlacklist.findOne({ refreshToken });
    if (isBlacklisted) req.session = null;
    // blacklist'te yoksa yeni access token almadan once mevcut olani blacklist'e al, varsa guncelle yoksa ekle
    if (!isBlacklisted)
      await AccessBlacklist.findOneAndUpdate(
        { userId: req.session?.id, accessToken: req.session?.accessToken },
        { userId: req.session?.id, accessToken: req.session?.accessToken },
        { upsert: true, new: true }
      );

    return !!isBlacklisted;
  },
  // ? Add To Blacklist On Logout
  logoutCookie: async (req) => {
    const userId = req.session?.id;
    if (!userId) throw new Error("User not found on cookie.");
    const accessToken = req.session?.accessToken;
    if (!accessToken) throw new Error("Access token not found on cookie.");
    const refreshToken = req.session?.refreshToken;
    if (!refreshToken) throw new Error("Refresh token not found on cookie.");
    // varsa guncelle yoksa ekle -> cookie - API cakismasina karsin duplicate onleme
    const newBlackAccess = await AccessBlacklist.findOneAndUpdate(
      { userId, accessToken },
      { userId, accessToken },
      { upsert: true, new: true }
    );
    const newBlackRefresh = await RefreshBlacklist.findOneAndUpdate(
      { userId, refreshToken },
      { userId, refreshToken },
      { upsert: true, new: true }
    );
    req.session = null;
    return [newBlackAccess, newBlackRefresh];
  },
  logoutAPI: async (req, accessToken, refreshToken) => {
    // logout'a atilan istekte authorization header yoksa access token'i decode edip userId'yi oradan al
    const userId = userIdGetter(req, accessToken);
    if (!userId)
      throw new Error(
        "User not found on request or headers. Your access token may be expired."
      );
    if (!accessToken) throw new Error("Access token not found on headers.");
    if (!refreshToken) throw new Error("Refresh token not found on headers.");
    // varsa guncelle yoksa ekle -> cookie - API cakismasina karsin duplicate onleme
    const newBlackAccess = await AccessBlacklist.findOneAndUpdate(
      { userId, accessToken },
      { userId, accessToken },
      { upsert: true, new: true }
    );
    const newBlackRefresh = await RefreshBlacklist.findOneAndUpdate(
      { userId, refreshToken },
      { userId, refreshToken },
      { upsert: true, new: true }
    );
    return [newBlackAccess, newBlackRefresh];
  },
};
