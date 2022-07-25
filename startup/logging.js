require("express-async-errors");
const winston = require("winston");

module.exports = function () {
  // Handle uncaught exceptions
  winston.exceptions.handle(
    new winston.transports.Console({ colorize:true, prettyPrint: true }));

    new winston.transports.File({
      filename: "uncaughtExceptions.log",
      name: "exceptions",
    });

  // handle rejected promises
  process.on("unhandledRejections", (ex) => {
    throw ex;
  });

  // Handle request cycle errors
  winston.add(
    new winston.transports.File({ filename: "errors.log", name: "default" })
  );
};
