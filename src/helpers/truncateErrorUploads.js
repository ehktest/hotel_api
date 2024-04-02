"use strict";

const { fs } = require("./logFolderCreate");
const { uploadPath } = require("../middlewares/upload");

module.exports = () => {
  const fileData = fs.readFileSync(uploadPath, "utf8");
  const filePaths = fileData.trim().split("\n");
  filePaths.forEach((filePath) => {
    fs.unlinkSync(filePath); // Dosyayı senkron olarak sil
  });

  // Log dosyasını temizle
  fs.truncateSync(uploadPath); // Log dosyasını senkron olarak temizle
};
