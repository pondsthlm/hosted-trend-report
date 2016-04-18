"use strict";

const express = require("express");
const path = require("path");
const config = require("exp-config");
const morgan = require("morgan");
const compress = require("compression");
const cacheBuster = require("../cacheBuster");
const fs = require("fs");

function setupCacheBusting(app, dirs) {
  const oneYear = 31557600000;
  const oneDay = 86400000;

  dirs.forEach((dir) => cacheBuster.buster.addBaseDir("public/" + dir));

  dirs.forEach((dir) => {
    let time = oneYear;
    if (dir === "img") {
      time = oneDay / 2;
    }
    app.use("/" + dir, cacheBuster.validateChecksum, serveStatic("public/" + dir, time));
  });
}

function serveStatic(dirname, age) {
  return express.static(path.join(__dirname, "../../" + dirname), {maxAge: age});
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
  if (config.requestLogging) {
    setupAccessLog(app);
  }
  // Akamai will only cache content with "Vary: Accept-Encoding" that also has "Content-Encoding: gzip"
  // the compress middleware always sends a vary header (which is correct from a HTTP standpoint) but we need
  // to set the threshold to 0 so that it will also compress small files
  app.use(compress({threshold: 0}));
  setupCacheBusting(app, ["js", "img", "font", "stylesheets"]);
  app.disable("x-powered-by");
};
