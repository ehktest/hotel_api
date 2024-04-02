"use strict";

const User = require("../models/user");

const { isAccessCookieBlacklisted } = require("../helpers/blacklistOps");

module.exports = async (req, res) => {
  if (req.session?.id) {
    if (await isAccessCookieBlacklisted(req)) {
      return new Error(
        "Your access token has been blocked, create new one and try again."
      );
    }
    const { id, password } = req.session;
    const user = await User.findById(id);

    // ? if password changed, log user out
    if (user && user.password === password) {
      // set req.userBrowser to user
      req.userBrowser = {
        _id: user._id,
        id: user.id,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
      };
      return true;
    } else {
      // clear session data and set req.userBrowser to undefined
      req.session = undefined;
      req.userBrowser = undefined;
      return false;
    }
  }
  return false;
  // next();
};
