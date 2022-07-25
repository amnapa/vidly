const config = require("config");

module.exports = function () {
  // If token signing key not found throw an error object
  if (!config.get("jwtPrivateKey")) {
    throw new Error("Fatal Error: jwtPrivateKey is not set.");
  }
};
