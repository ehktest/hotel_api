"use strict";

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const refreshAccessToken = require("../helpers/refreshAccessToken");
const {
  isRefreshAPIBlacklisted,
  isRefreshCookieBlacklisted,
  logoutAPI,
  logoutCookie,
} = require("../helpers/blacklistOps");

module.exports = {
  login: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "Login <Permissions: Public>"
      #swagger.description = "Login with username and password"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          email: 'admin@test.com',
          password:'Qwer1234!'
        }
      }
    */

    // ? eger kullanici zaten login olmussa istegi degerlendirmesin
    if (process.env.NODE_ENV === "production" && req.isUserAuthenticated)
      throw new Error(
        "You are already logged in. Clear cookies or dont send any access token on headers to re-login."
      );

    // ? kullanici giris yaparken username veya email gonderebilsin
    const { email, password, username } = req.body;
    if ((email || password) && password) {
      const user = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (user && user.password === passwordEncrypt(password)) {
        if (user.isActive) {
          /* JWT */

          // https://www.npmjs.com/package/jsonwebtoken
          // expiresIn: expressed in seconds or a string describing a time span vercel/ms.
          // Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

          // daha kritik/hassas veri, daha kisa omurlu
          const accessInfo = {
            key: process.env.ACCESS_KEY,
            time: process.env?.ACCESS_EXP || "30m",
            data: {
              _id: user._id,
              id: user.id,
              isActive: user.isActive,
              isAdmin: user.isAdmin,
            },
          };

          // daha az kritik/hassas veri, daha uzun omurlu
          const refreshInfo = {
            key: process.env.REFRESH_KEY,
            time: process.env?.REFRESH_EXP || "3d",
            data: {
              id: user.id,
              password: user.password, // encyrpted
            },
          };

          // JWT token'lari olustur(jwt.sign)
          // jwt.sign(payload, secretOrPrivateKey, [options, callback])
          const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
            expiresIn: accessInfo.time,
          });

          const refreshToken = jwt.sign(refreshInfo.data, refreshInfo.key, {
            expiresIn: refreshInfo.time,
          });
          /* JWT */

          /* SESSION */
          if (req.session) {
            req.session.id = user.id;
            req.session.password = user.password;
            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken; // COOKIE ILE REFRESH TOKEN'I GONDERMEK MANTIKLI OLSA DA MOBILE APPLICATION'LAR COOKIE DESTEKLEMEDIGI ICIN ONLAR OZELINDE HEADER KULLANARAK JWT AUTH'A DEVAM ETMEK BEST-PRACTICE'TIR.
          }
          /* SESSION */

          res.status(200).json({
            // token: tokenData.token,
            bearer: {
              access: accessToken,
              refresh: refreshToken,
            },
            error: false,
            message: "Login OK",
            user,
          });
        } else {
          res.errorStatusCode = 401;
          throw new Error("This account is not active");
        }
      } else {
        res.errorStatusCode = 401;
        throw new Error("Login parameters are not true.");
      }
    } else {
      res.errorStatusCode = 401;
      throw new Error("Email/username and password required.");
    }
  },

  refresh_browsers: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "JWT: Refresh - Cookie <Permissions: Public>"
      #swagger.description = 'Refresh access token via cookie.'
    */

    if (req.session?.id) {
      // refresh token blacklist'te degilse yenisini vermeden once mevcut access token'i blacklist'e al
      if (await isRefreshCookieBlacklisted(req)) {
        res.status(401).json({
          error: true,
          message:
            "Your refresh token has been blocked, login with your credentials again.",
        });
      }

      // COOKIE ILE REFRESH TOKEN'I GONDERMEK BROWSER'LAR ICIN COK DAHA GUVENLIDIR
      const refreshToken = req.session?.refreshToken;
      const newAccessToken = await refreshAccessToken(refreshToken);
      res.status(200).json({
        error: false,
        bearer: { access: newAccessToken },
      });
    } else {
      res.status(200).json({
        error: true,
        message:
          "You cant use this endpoint because you are not using cookies.",
      });
    }
  },

  refresh_others: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "JWT: Refresh - API <Permissions: Public>"
      #swagger.description = 'Refresh access token via refresh token. You need to set your refresh token to X-Refresh-Token header and access token to Authorization header in <Bearer ...accessToken...> format to refresh your access token.'
    */

    // * header ile X-Refresh-Token custom key'i ile API refresh'i handle etmek, post ile body'den refresh token gondermeye gore daha guvenlidir ve method esnekligi sunar. Boyle oldugunda get istegi de yeterli olur cookie'de oldugu gibi, mobile application'larda header ile veri iletmek sik kullanilan bir yontemdir.

    // refresh token blacklist'te degilse yenisini vermeden once mevcut access token'i blacklist'e al
    const refreshToken = req.headers?.["x-refresh-token"];
    const auth = req.headers?.authorization || null; // Bearer accessToken
    const tokenKey = auth ? auth.split(" ") : null; // ['Bearer', 'accessToken']
    const accessToken = tokenKey && tokenKey[0] === "Bearer" && tokenKey[1];
    if (!(refreshToken && accessToken)) {
      res.status(401).json({
        error: true,
        message:
          "Your must set your refresh token to X-Refresh-Token header and your access token to Authorization header in <Bearer ...accessToken...> format properly.",
      });
    } else if (await isRefreshAPIBlacklisted(req, accessToken, refreshToken)) {
      res.status(401).json({
        error: true,
        message:
          "Your refresh token has been blocked, login with your credentials again.",
      });
    } else {
      const newAccessToken = await refreshAccessToken(refreshToken);
      res.status(200).json({
        error: false,
        bearer: { access: newAccessToken },
      });
    }
  },

  logout: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "Logout <Permissions: Public>"
      #swagger.description = 'Delete refresh token from cookie and blacklist tokens. You need to set your refresh token to X-Refresh-Token header and access token to Authorization header in <Bearer ...accessToken...> format to safely blacklist them.'
    */

    /* SESSION */
    if (req.session?.id) {
      await logoutCookie(req);
      req.session = null; // her ihtimale karsi cookie burada da sifirlaniyor
    }
    /* SESSION */

    /* TOKEN */
    const auth = req.headers?.authorization || null; // Bearer accessToken
    const tokenKey = auth ? auth.split(" ") : null; // ['Bearer', 'accessToken']
    /* TOKEN */

    /* JWT */
    // * Buradaki logout yapisi blacklist'e almak icin yapilmistir, suresi dolmamasina ragmen logout yapildiginda jwt token'lari blacklist'e alinir ve tekrar kullanilamaz hale gelir.
    const refreshToken = req.headers?.["x-refresh-token"] || null; // refreshToken

    if (tokenKey && tokenKey[0] == "Bearer" && refreshToken) {
      await logoutAPI(req, tokenKey[1], refreshToken);

      res.status(200).json({
        error: false,
        message:
          "Cokies deleted if there were, access and refresh tokens have been blacklisted successfully.",
      });
      /* JWT */
    } else {
      res.status(200).json({
        error: false,
        message: "Cokies deleted if there were, no token info found on headers",
      });
    }
  },
};
