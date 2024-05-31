const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
const fs = require("fs");
const http = require("http");
const https = require("https");
=======
>>>>>>> da6660b (Минимально обновил)
require("dotenv").config();

const telegraf = require("./routers/telegraf");

<<<<<<< HEAD
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
=======
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());


app.use(bodyParser.json());
app.use("/api/telegraf", telegraf);

app.listen(port, () => {
  console.log(`Зашли и вышли, приключения на ${port} порту`);
});
>>>>>>> da6660b (Минимально обновил)
