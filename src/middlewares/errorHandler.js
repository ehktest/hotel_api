const { logEvents } = require("./fsLogging");

const formatErrorStack = (err) => err.stack.split("\n").slice(0, 2).join("\n");

module.exports = (err, req, res, next) => {
  // checking response whether custom error status code is set
  const errorStatusCode = res?.errorStatusCode ?? err?.statusCode ?? 500;
  // print error on server console
  console.error(`Error : ${(err?.stack ?? err?.cause ?? err?.message) || err}`);
  // * deactivate loggers for vercel deploy if activated:
  if (process.env.NODE_ENV !== "production") {
    // logging errors on local
    const origin = req.headers.origin ?? "localhost";
    const now = new Date();
    // console.log(typeof now, now); // object 2024-03-21T19:52:51.712Z
    const today = now.toISOString().split("T")[0];
    // console.log(typeof today, today); // string 2024-03-21
    logEvents(
      `ERROR -> ${formatErrorStack(err)}\t| METHOD -> ${
        req.method
      }\t| ORIGIN -> ${origin}\t| URL ->${req.url}\t| USER -> ${
        // }\t| URL ->${req.url}\t| USER -> ${req.user?.email}\t| TOKEN -> ${
        req.headers.authorization
      }`,
      `ERRORS_${today}.txt`
    );
  }
  res
    .status(errorStatusCode) // 500 Internal Server Error
    .send({
      error: true,
      code: errorStatusCode,
      message: err?.message,
      // Detaylı hata bilgisi sadece geliştirme ortamında döndürülür
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
      }),
    });
};
