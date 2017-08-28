"use strict";

const alive = require("../routes/alive.js");
const status = require("../routes/status.js");
const iframeRoute = require("../routes/iframe-route.js");
const missingContent = require("../routes/missing-content.js");


module.exports = function routes(app) {
  app.get("/_alive", alive);
  app.head("/_alive", alive);

  app.get("/_status", status);
  app.head("/_status", status);

  app.get("/demo", (req, res) => {
    res.render("dodo");
  });
  app.get("/tvspelare/video/:externalPath(*)", iframeRoute);

  app.get("/*", missingContent);

};
