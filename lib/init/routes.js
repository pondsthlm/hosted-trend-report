"use strict";

const alive = require("../routes/alive.js");
const status = require("../routes/status.js");
const assetsController = require("../routes/assets-controller");
const iframeController = require("../routes/iframe-controller");
const demoController = require("../routes/demo-controller");
const missingContent = require("../routes/missing-content");


module.exports = function routes(app) {
  app.get("/_alive", alive);
  app.head("/_alive", alive);

  app.get("/_status", status);
  app.head("/_status", status);

  app.get("/demo", demoController);
  app.get("/tvspelare/video/:externalPath(*)", iframeController);
  app.get("/ponyo/assets/:internalPath(*)", assetsController);

  app.get("/*", missingContent);

};
