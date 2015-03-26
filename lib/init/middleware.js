"use strict";

var express = require("express");
var path = require("path");
var config = require("exp-config");
var morgan = require("morgan");
var compress = require("compression");

module.exports = function (app) {
  if (config.boolean("requestLogging")) {
    app.use(morgan("combined"));
  }

  // Akamai will only cache content with "Vary: Accept-Encoding" that also has "Content-Encoding: gzip"
  // the compress middleware always sends a vary header (which is correct from a HTTP standpoint) but we need
  // to set the threshold to 0 so that it will also compress small files
  app.use(compress({threshold: 0}));

  var oneYear = 31557600000;
  var oneDay = 86400000;
  app.use("/font", serveStatic("public/font", oneYear));
  app.use("/js", serveStatic("public/js", oneYear));
  app.use("/stylesheets", serveStatic("public/stylesheets", oneYear));
  app.use("/img", serveStatic("public/img", oneDay / 2));

  app.disable("x-powered-by");
};

function serveStatic(dirname, age) {
  return express.static(path.join(__dirname, "../../" + dirname), { maxAge: age });
}
