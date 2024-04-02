"use strict";

// const Token = require("../models/token");
const jwt = require("jsonwebtoken");

const { isAccessAPIBlacklisted } = require("../helpers/blacklistOps");

module.exports = async (req, res) => {
  // Authorization: Token ...
  // Authorization: ApiKey ...
  // Authorization: X-API-KEY ...
  // Authorization: x-auth-token ...
  // Authorization: Bearer ...

  // ? Kullanici varsa req.userAPI'yi doldur, yoksa undefined ata. Yani yalnizca user'i tanir ve isler. Route erisimine yonelik kisitlama permissions(authorization)'ta yapilmaktadir.
  const auth = req.headers?.authorization || null; // Bearer accessToken
  const tokenKey = auth ? auth.split(" ") : null; // ['Bearer', 'accessToken']

  let verified = false;
  if (tokenKey && tokenKey[0] == "Bearer") {
    // JWT AccessToken Authentication
    // jwt.verify(token, secretOrPublicKey, [options, callback])
    // https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
    verified = jwt.verify(
      tokenKey[1],
      process.env.ACCESS_KEY,
      async (error, decodedAccessData) => {
        if (decodedAccessData) {
          // check access token whether blacklisted
          if (await isAccessAPIBlacklisted(tokenKey[1])) {
            return new Error(
              "Your access token has been blocked, create new one and try again."
            );
          }
          req.userAPI = decodedAccessData;
          return true;
        } else {
          req.userAPI = undefined;
          return false;
        }
      }
    );
  }

  return verified;
  // next();
};
