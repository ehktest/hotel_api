"use strict";

const { mongoose } = require("../configs/dbConnection");
const { Schema, model, models } = mongoose;
const passwordEncrypt = require("../helpers/passwordEncrypt");
const CustomError = require("../errors/customError");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [true, "Email field is required"], // custom error message
      unique: true,
      index: true,
      validate: [
        (email) => {
          if (
            email.match(/@/g)?.length != 1 || // match ile null donebilecegi icin optional chaining
            !/^[_.a-z0-9]{4,}@[a-z0-9.]{4,}$/.test(email)
          )
            throw new CustomError("Invalid email pattern", 400);

          let [username, domainSubdomainTLD] = email.split("@");
          let errors = [];

          // Username kontrolleri
          if (/^[_.]/.test(username))
            errors.push("Username can't start with an underscore or a dot.");
          if (/[_.]$/.test(username))
            errors.push("Username can't end with an underscore or a dot.");
          if (/[_.]{2,}/.test(username))
            errors.push(
              "Username can't contain consecutive underscores or dots."
            );
          if (!username.match(/[a-z]/g))
            errors.push("Username must contain at least 1 lowercase letter.");
          if (!/[a-z0-9_.]{4,}/.test(username))
            errors.push(
              "Username must contain at least 4 characters. Only lowercase letters, digits, dots and underscores are allowed."
            );

          // Domain ve TLD kontrolleri
          if (domainSubdomainTLD.match(/\./g)?.length > 2)
            errors.push("Subdomain-Domain-TLD is not valid.");
          if (!/^[a-z0-9]+\./.test(domainSubdomainTLD))
            errors.push("Domain/Subdomain is not valid.");
          if (
            domainSubdomainTLD.match(/\./g)?.length === 2 &&
            !/\.[a-z0-9]+\./.test(domainSubdomainTLD)
          )
            errors.push("Domain is not valid.");
          if (
            domainSubdomainTLD.match(/\./g)?.length < 1 ||
            domainSubdomainTLD.endsWith(".") ||
            !/\.[a-z]{1,3}$/.test(domainSubdomainTLD)
          )
            errors.push("TLD is not valid.");

          if (errors.length) {
            throw new CustomError(errors.join(" "), 400);
          }
          return true;
        },
      ],
    },
    password: {
      type: String,
      trim: true,
      required: true,
      // ! setter validate'ten once calistigi icin setter'da validasyon yapilip gecerse dilenen manipulasyon yapilip gecmezse belirli bir deger dondurulur ve validate ile yalnizca bu degerin dondurulup dondurulmedigi kontrol edilir. Boylece hem setter ve validate kullanilmis olur
      set: function (password) {
        const passwordRegex =
          /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,16}/;
        if (!passwordRegex.test(password)) {
          return "wrong";
        } else {
          return passwordEncrypt(password);
        }
      },
      validate: [
        (password) => password !== "wrong",
        "Password must contain at least 1 uppercase & lowercase letter, 1 digit, 1 special character and must be between 8 and 16 characters in total.",
      ],
    },
    username: {
      type: String,
      trim: true,
      required: true,
      index: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "user",
    timestamps: {
      currentTime: () => {
        let date = new Date();
        let newDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60 * 1000
        );
        return newDate;
      },
    },
  }
);

module.exports = models?.User || model("User", UserSchema);

// email icin tek regex alternatifi:
// email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
