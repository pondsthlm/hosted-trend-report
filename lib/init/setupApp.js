"use strict";

const express = require("express");
const errorHandler = require("./errorHandler");
const generic = require("./generic.js");
const middleware = require("./middleware.js");
const views = require("./views.js");
const routes = require("./routes.js");
const config = require("exp-config");
const bugsnag = require("bugsnag");

if (config.bugsnagApiKey) {
  bugsnag.register(config.bugsnagApiKey);
}

function setupApp() {
  const app = express();

  generic(app);
  middleware(app);
  views(app);
  routes(app);

  app.use(errorHandler);
  if (config.bugsnagApiKey) {
    app.use(bugsnag.errorHandler);
  }
  return app;
}

module.exports = setupApp;
