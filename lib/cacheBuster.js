"use strict";

const cacheBuster = require("exp-cachebuster")([], process.env.NODE_ENV !== "development");
const validateChecksum = cacheBuster.validateChecksumMiddleware();

module.exports = {
  buster: cacheBuster,
  bust: cacheBuster.bust,
  validateChecksum: validateChecksum
};
