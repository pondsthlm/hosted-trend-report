"use strict";

const express = require("express");
const errorHandler = require("./errorHandler");
const middleware = require("./middleware.js");
const routes = require("./routes.js");
const config = require("exp-config");
const bugsnag = require("bugsnag");
const http = require("http");
const https = require("https");

if (config.bugsnagApiKey) {
  bugsnag.register(config.bugsnagApiKey);
}

function setupApp() {
  const app = express();

  // Don't limit the number of outgoing HTTP requests (defaults to 4 simultaneous requests)
  http.globalAgent.maxSockets = Infinity;
  https.globalAgent.maxSockets = Infinity;

  // Make sure dates are displayed in the correct timezone
  process.env.TZ = "Europe/Stockholm";

  middleware(app);
  routes(app);

  app.use(errorHandler);
  if (config.bugsnagApiKey) {
    app.use(bugsnag.errorHandler);
  }
  return app;
}

module.exports = setupApp;
