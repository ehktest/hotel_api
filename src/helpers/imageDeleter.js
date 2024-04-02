"use strict";
const { fs, path } = require("../helpers/logFolderCreate");
const rootDir = path.join(__dirname, "..", "..");

module.exports = async (req, Model, { next = undefined }) => {
  if (req.files) {
    try {
      const modelDoc = await Model.findById(Object.values(req.params)[0]);
      const images = modelDoc.images;
      images.forEach((image) => {
        fs.unlinkSync(path.join(rootDir, image));
      });
      await Model.findByIdAndUpdate(
        Object.values(req.params)[0],
        { images: [] },
        { runValidators: true }
      );
    } catch (error) {
      if (next) return next(error);
    }
  }
};
