// yarn add date-fns
const { format } = require("date-fns");

const {
  logFolderCreate,
  fs,
  fsPromises,
  path,
} = require("../helpers/logFolderCreate");

const logEvents = async (message, logName) => {
  const dateTime = `${format(new Date(), "yyyy.MM.dd  HH:mm:ss")}`;
  const logItem = `${dateTime} -- ${message}\n`;

  try {
    logFolderCreate();

    // fsPromises.appendFile(path, data[, options])
    await fsPromises.appendFile(
      path.join(__dirname, "..", "..", "logs", logName),
      logItem
    );
    // await fs.createWriteStream(path.join(__dirname, "..", "..", "logs", logName), {
    //   flags: "a+",
    // }).write(logItem);
  } catch (err) {
    console.log(err);
  }
};

// logger'lar response tamamlandiktan hemen sonra calismalidir ki authentication verilerine de erisebilsin
const logger = (req, res, next) => {
  res.on("finish", () => {
    const origin = req.headers.origin ?? "localhost";
    logEvents(
      `${req.method}\t${origin}\t${req.url}\t${
        req.userAPI ? req.userAPI?.email : req.userBrowser?.email
      }\t${req.headers.authorization}`,
      "reqLog.txt"
    );
    console.log(`${req.method} ${req.path}`);
  });
  next();
};

module.exports = { logger, logEvents, fs, fsPromises, path };
