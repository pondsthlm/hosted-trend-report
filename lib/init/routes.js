"use strict";

const alive = require("../routes/alive.js");
const revision = require("../routes/revision.js");

module.exports = function routes(app) {

  app.get("/_alive", alive);
  app.head("/_alive", alive);

  app.get("/_revision", revision);
  app.head("/_revision", revision);

  app.get("/", (req, res) => {
    res.send(`<html><body style='background: red'><h1 style='color: white'>Hello from node starterapp</h1></body></html>`);
  });

};
