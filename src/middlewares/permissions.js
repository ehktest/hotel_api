"use strict";

const CustomError = require("../errors/customError");

// Permissions -> authorization

const getUser = (req) => (req.userAPI ? req.userAPI : req.userBrowser);

module.exports = {
  isLogin: (req, res, next) => {
    // return next();
    const user = getUser(req);
    if (user?.isActive) {
      next();
    } else {
      throw new CustomError("You must be authenticated first", 403);
    }
  },

  isAdmin: (req, res, next) => {
    // return next();
    const user = getUser(req);
    if (user?.isActive && user?.isAdmin) {
      next();
    } else {
      throw new CustomError(
        "You must be authenticated and have admin permissions",
        403
      );
    }
  },

  isAdminOrOwn: (req, res, next) => {
    // return next();
    const userId = req.params?.userId;
    const user = getUser(req);
    if (user?.isActive && (user?.isAdmin || String(user._id) === userId)) {
      next();
    } else {
      throw new CustomError(
        "You must be authenticated and have admin permissions or must be that user",
        403
      );
    }
  },
  getUser,
};
