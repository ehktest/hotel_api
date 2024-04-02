"use strict";

const { fs, fsPromises } = require("./logFolderCreate");

module.exports = async (uploadDir, uploadPath) => {
  // Önce dizini kontrol et ve yoksa olustur
  if (!fs.existsSync(uploadDir)) {
    await fsPromises.mkdir(uploadDir, { recursive: true });
  }

  // Sonra dosyayi kontrol et ve yoksa olustur
  try {
    if (!fs.existsSync(uploadPath)) {
      await fsPromises.writeFile(uploadPath, ""); // Bos bir icerikle dosya olustur
    }
  } catch (error) {
    console.error("File couldnt be created:", error);
  }
};
