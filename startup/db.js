const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

module.exports = function () {
  const db = config.get("database");
  console.log(db);
  // Connect to Mongo DB
  mongoose
    .connect(db)
    .then(() => winston.info(`Connected to ${db}`));
};
