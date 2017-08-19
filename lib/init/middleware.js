"use strict";

const config = require("exp-config");
const morgan = require("morgan");
const fs = require("fs");
const bugsnag = require("bugsnag");
const cacheBuster = require("../cacheBuster");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

function setupCacheBusting(app, dirs) {
  const oneYear = 31557600000;
  const oneDay = 86400000;

  dirs.forEach((dir) => cacheBuster.buster.addBaseDir(`public/${dir}`));

  dirs.forEach((dir) => {
    let time = oneYear;
    if (dir === "img") {
      time = oneDay / 2;
    }

    app.use(`/${dir}`, cacheBuster.validateChecksum, serveStatic(`public/${dir}`, time));
  });
}

function serveStatic(dirname, age) {
  // This will stop the middleware chain and only run next if a static file gives 404
  return express.static(path.join(__dirname, `../../${dirname}`), {maxAge: age, etag: false});
}

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

  app.use(cookieParser());

  setupCacheBusting(app, ["assets"]);

  app.disable("x-powered-by");
};
