"use strict";

const express = require("express");
const generic = require("./generic.js");
const middleware = require("./middleware.js");
const views = require("./views.js");
const routes = require("./routes.js");

function setupApp() {
  const app = express();

  generic(app);
  middleware(app);
  views(app);
  routes(app);

  return app;
}

module.exports = setupApp;
