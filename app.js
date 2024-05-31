const express = require("express");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const https = require("https");
require("dotenv").config();

const telegraf = require("./routers/telegraf");

const options = {
  cert: fs.readFileSync("./ssl/luxeivan.ru_cert.pem"),
  key: fs.readFileSync("./ssl/luxeivan.ru_private_key.pem"),
};

const secretSession = process.env.SECRET_SESSION;
const port = process.env.PORT;
const portSSL = process.env.PORT_SSL;

const app = express();

app.use("/api/telegraf", telegraf);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);
httpServer.listen(port, () => {
  console.log(`Зашли и вышли, приключения на ${port} порту`);
});
httpsServer.listen(portSSL);
