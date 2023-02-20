const express = require("express");
const cors = require('cors');
const winston = require("winston");
const app = express();

app.use(cors());
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);

// Listen to port 3000
const port = process.env.PORT || 3001;
const server = app.listen(port, () => winston.info("listening on port 3000..."));
module.exports = server;