"use strict";

var express = require("express");
var path = require("path");
var config = require("exp-config");
var morgan = require("morgan");
var compress = require("compression");
var cacheBuster = require("../cacheBuster");

function setupCacheBusting(app, dirs) {
  var oneYear = 31557600000;
  var oneDay = 86400000;

  dirs.forEach(function (dir) {
    cacheBuster.buster.addBaseDir("public/" + dir);
  });

  dirs.forEach(function (dir) {
    var time = oneYear;
    if (dir === "img") {
      time = oneDay / 2;
    }
    app.use("/" + dir, cacheBuster.validateChecksum, serveStatic("public/" + dir, time));
  });
}

function serveStatic(dirname, age) {
  return express.static(path.join(__dirname, "../../" + dirname), {maxAge: age});
}

module.exports = function (app) {

  if (config.boolean("requestLogging")) {
    app.use(morgan("combined"));
  }

  // Akamai will only cache content with "Vary: Accept-Encoding" that also has "Content-Encoding: gzip"
  // the compress middleware always sends a vary header (which is correct from a HTTP standpoint) but we need
  // to set the threshold to 0 so that it will also compress small files
  app.use(compress({threshold: 0}));
  setupCacheBusting(app, ["js", "img", "font", "stylesheets"]);
  app.disable("x-powered-by");
};

