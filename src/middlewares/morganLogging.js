"use strict";

// log kaydi icin morgan package'i kullanilabilir, express docs'ta 3rd party middlewares'te yer alir.
// https://expressjs.com/en/resources/middleware/morgan.html
// yarn add morgan

// morgan logger
const morgan = require("morgan");

// morgan log'larini local file'a kaydetmek icin node fs modulu
const fs = require("node:fs");
const { logFolderCreate } = require("../helpers/logFolderCreate");

// ? morgan logger with format string and write to local file day by day
const now = new Date();
// console.log(typeof now, now); // object 2024-03-21T19:52:51.712Z
// const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
const today = now.toISOString().split("T")[0];
// console.log(typeof today, today); // string 2024-03-21

// morgan logger with predefined format
// morgan("combined") // 127.0.0.1 - - [21/Mar/2024:19:33:46 +0000] "GET /departments HTTP/1.1" 200 717 "-" "Thunder Client (https://www.thunderclient.com)"
// morgan("common") // 127.0.0.1 - - [21/Mar/2024:19:33:46 +0000] "GET /departments HTTP/1.1" 200 717
// morgan("dev") // GET /departments 200 31.653 ms - 717
// morgan("short") // 127.0.0.1 - GET /departments HTTP/1.1 200 717 - 31.653 ms
// morgan("tiny") // GET /departments 200 717 - 31.653 ms

// Using morgan without local save(loggin only on terminal)
//   morgan(
//     "IP=:remote-addr | TIME=:date[clf] | METHOD=:method | URL=:url | STATUS=:status | LENGTH=:res[content-length] | REF=:referrer |  AGENT=:user-agent",
//     {
//       stream: fs.createWriteStream("./access.log", { flags: "a+" }),
//     }
//   )

// nodejs file system flags -> https://nodejs.org/api/fs.html#file-system-flags
// 'a+': Open file for reading and appending. The file is created if it does not exist.

// :date[format]-> clf for the common log format ("10/Oct/2000:13:55:36 +0000")

// :res[header] -> The given header of the response. If the header is not present, the value will be displayed as "-" in the log.
// The Content-Length header indicates the size of the message body, in bytes, sent to the recipient.
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length

// To define a token, simply invoke morgan.token() with the name and a callback function. This callback function is expected to return a string value. The value returned is then available as “:type” in this case:
// morgan.token('type', function (req, res) { return req.headers['content-type'] })
// Calling morgan.token() using the same name as an existing token will overwrite that token definition.

// :url -> query'lerle birlikte request gonderilen url doner

// :referrer -> The Referrer header of the request. This will use the standard mis-spelled Referer header if exists, otherwise Referrer.
// HTML'de, <a> etiketlerine rel="noreferrer" gibi bir öznitelik ekleyerek, tarayıcıya bu bağlantı üzerinden yapılan bir yönlendirme sırasında Referer başlığını göndermemesini söyleyebilirsiniz. Bu, gizlilik ve güvenlik açısından önemli olabilir. Ancak, referrer bilgisi genellikle tarayıcı tarafından otomatik olarak yönetilir ve kullanıcı veya bir web geliştiricisi tarafından bir <a> etiketindeki ref özniteliği aracılığıyla doğrudan ayarlanmaz.

// * log folder'i yoksa olustur.
logFolderCreate();

// ? morgan'a custom token'lar eklenerek string format'ta kullaniliyor
morgan.token("user", (req, res) => req.user?.email);
morgan.token("user-roles", (req, res) =>
  JSON.stringify({
    isActive: req.user?.isActive,
    isLead: req.user?.isLead,
    isAdmin: req.user?.isAdmin,
  })
);

module.exports = morgan(
  "IP=:remote-addr | USER=:user | USER_ROLES=:user-roles | TIME=:date[clf] | METHOD=:method | URL=:url | STATUS=:status | LENGTH=:res[content-length] | REF=:referrer |  AGENT=:user-agent",
  {
    stream: fs.createWriteStream(`./logs/${today}.log`, { flags: "a+" }),
  }
);
