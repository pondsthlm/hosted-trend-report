"use strict";

const express = require("express");
const config = require("exp-config");
const morgan = require("morgan");
const fs = require("fs");
const bugsnag = require("bugsnag");

function setupAccessLog(app) {
  const logFormat = ":remote-addr - :remote-user [:date[iso]] \":method :url HTTP/:http-version\" :status :res[content-length] :response-time ms";
  const options = {};
  if (config.requestLogging !== "stdout") {
    const accessLogStream = fs.createWriteStream(config.requestLogging, {flags: "a"});
    options.stream = accessLogStream;
  }
  app.use(morgan(logFormat, options));
}

module.exports = function (app) {
  if (config.bugsnagApiKey) {
    app.use(bugsnag.requestHandler);
  }

  if (config.requestLogging) {
    setupAccessLog(app);
  }

  app.disable("x-powered-by");

  app.use(express.static("public"));
};
