"use strict";
var path = require("path");
var fs = require("fs");
var Log = require("log");
var config = require("exp-config");

function getLoggerStream() {
  switch (config.log) {
    case "file":
      return fs.createWriteStream(path.join(__dirname, "..", "logs", config.envName + ".log"));
    case "stdout":
      return process.stdout;
    default:
      throw new Error("Invalid logger: " + config.log);
  }
}

module.exports = new Log(config.logLevel || "info", getLoggerStream());
