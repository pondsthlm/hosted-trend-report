"use strict";

const alive = require("../routes/alive.js");
const status = require("../routes/status.js");
const demoController = require("../routes/demo-controller");
const missingContent = require("../routes/missing-content");


module.exports = function routes(app) {
  app.get("/_alive", alive);
  app.head("/_alive", alive);

  app.get("/_status", status);
  app.head("/_status", status);

  app.get("/demo", demoController);

  app.get("/*", missingContent);

};
