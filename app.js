const express = require("express");
const cors = require("cors");
require("dotenv").config();

const telegraf = require("./routers/telegraf");

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
