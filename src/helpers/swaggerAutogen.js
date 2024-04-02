"use strict";
// https://swagger-autogen.github.io/docs/getting-started/advanced-usage
/* -------------------------------------------------------
                  EXPRESS - Swagger JSON
------------------------------------------------------- */
require("dotenv").config();
// const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' })
const swaggerAutogen = require("swagger-autogen")();
const packageJson = require("../../package.json");
const HOST = process.env?.HOST || "127.0.0.1";
const PORT = process.env?.PORT || 8000;
/* ------------------------------------------------------- */
// npm i swagger-autogen
// https://swagger-autogen.github.io/docs/
/* ------------------------------------------------------- *
const options = {
	openapi:          <string>,     // Enable/Disable OpenAPI.                        By default is null
	language:         <string>,     // Change response language.                      By default is 'en-US'
	disableLogs:      <boolean>,    // Enable/Disable logs.                           By default is false
	autoHeaders:      <boolean>,    // Enable/Disable automatic headers recognition.  By default is true
	autoQuery:        <boolean>,    // Enable/Disable automatic query recognition.    By default is true
	autoBody:         <boolean>,    // Enable/Disable automatic body recognition.     By default is true
	writeOutputFile:  <boolean>     // Enable/Disable writing the output file.        By default is true
};
/* ------------------------------------------------------- */

const document = {
  // info: {
  // 	version: "1.0.0",
  // 	title: "Personnel API",
  // 	description: "Personnel Management API Service",
  // 	termsOfService: "https://portfolio-ehkarabas.netlify.app/",
  // 	contact: { name: "Huseyin Karabas", email: "ehkarabas@gmail.com" },
  // 	license: { name: "BSD License", },
  // },
  info: {
    version: packageJson.version,
    title: packageJson.title || "Hotel API",
    description: packageJson.description,
    // termsOfService: "https://portfolio-ehkarabas.netlify.app/",
    contact: {
      name: packageJson.author,
      email: "ehkarabas@gmail.com",
      url: "https://portfolio-ehkarabas.netlify.app/",
    },
    license: { name: packageJson.license },
  },
  host: `${HOST}:${PORT}`,
  basePath: "/",
  schemes: ["http", "https"],
  // JWT/Token Settings:
  securityDefinitions: {
    JWTAccess: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description:
        "Enter Your AccessToken (JWT) for Login. Example: <b>Bearer <i>...accessToken...<i></b>",
    },
    JWTRefresh: {
      type: "apiKey",
      in: "header",
      name: "X-Refresh-Token",
      description:
        "Enter Your RefreshToken (JWT) to blacklist it on Logout and to validate whether blacklisted before on Refresh. Example: <b>...refreshToken...</b>",
    },
  },
  security: [{ JWTAccess: [] }, { JWTRefresh: [] }],
  definitions: {
    "/auth/login": {
      email: {
        type: "String",
        required: true,
      },
      password: {
        type: "String",
        required: true,
      },
    },
    "/auth/refresh_others": {
      GET: {
        type: "String",
        required: true,
        description:
          "To refresh your access token on the API, set your refresh token in the 'X-Refresh-Token' header using the format '...refreshToken...' and place your access token in the 'Authorization' header with the format 'Bearer ...accessToken...'.",
      },
    },
    "/auth/refresh_browsers": {
      GET: {
        type: "String",
        required: true,
        description:
          "Just send a GET request to refresh your access token on browsers.",
      },
    },
    "/auth/logout": {
      GET: {
        type: "String",
        required: true,
        description:
          "To ensure your security when logging out, set your refresh token in the 'X-Refresh-Token' header using the format '...refreshToken...', and place your access token in the 'Authorization' header with the format 'Bearer ...accessToken...'. This procedure will effectively blacklist them.",
      },
    },
    User: require("../models/user").schema.obj,
    Room: require("../models/room").schema.obj,
    Reservation: require("../models/reservation").schema.obj,
  },
};

// /* NOTE: If you are using the express Router, you must pass in the 'routes' only the root file where the route starts, such as index.js, app.js, routes.js, etc ... */
const routes = ["../../index.js"];
const outputFile = "../configs/swagger.json";

// Create JSON file:
swaggerAutogen(outputFile, routes, document);
