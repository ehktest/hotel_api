"use strict";

const tokenAuthentication = require("./tokenAuthentication");
const cookieAuthentication = require("./cookieAuthentication");

module.exports = async (req, res, next) => {
  // * token oncelikli authentication kombinasyonu. token auth blacklist'e takilirsa ve client bir yandan cookie de geri gonderiyorsa, cookie backend'e ulasmadan error response donulecek
  const tokenAuthResult = await tokenAuthentication(req, res);
  if (tokenAuthResult instanceof Error) return next(tokenAuthResult); // blacklisted header token
  const cookieAuthResult = await cookieAuthentication(req, res);
  if (cookieAuthResult instanceof Error) return next(cookieAuthResult); // blacklisted cookie token
  if (!(tokenAuthResult || cookieAuthResult)) {
    req.isUserAuthenticated = false;
  } else {
    req.isUserAuthenticated = true;
  }
  next();
};
