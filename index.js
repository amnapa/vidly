const express = require("express");
const winston = require("winston");
const app = express();

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);

// Listen to port 3000
const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info("listening on port 3000..."));
module.exports = server;