"use strict";

var cacheBuster = require("exp-cachebuster")([], process.env.NODE_ENV !== "development");
var validateChecksum = cacheBuster.validateChecksumMiddleware();

module.exports = {
  buster: cacheBuster,
  bust: cacheBuster.bust,
  validateChecksum: validateChecksum
};
