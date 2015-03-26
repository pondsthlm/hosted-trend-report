"use strict";

var express = require("express");
var generic = require("./generic.js");
var middleware = require("./middleware.js");
var views = require("./views.js");
var routes = require("./routes.js");

function setupApp() {
  var app = express();

  generic(app);
  middleware(app);
  views(app);
  routes(app);

  return app;
}

module.exports = setupApp;
