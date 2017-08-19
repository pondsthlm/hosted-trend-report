"use strict";

const alive = require("../routes/alive.js");
const status = require("../routes/status.js");

module.exports = function routes(app) {

  app.get("/_alive", alive);
  app.head("/_alive", alive);

  app.get("/_status", status);
  app.head("/_status", status);

  app.get("/", (req, res) => {
    res.send("<html><head><script type='text/javascript' src='/assets/js/bundle.js'></script></head><body style='background: red'><h1 style='color: white'>Hello from node starterapp</h1></body></html>");
  });

};
