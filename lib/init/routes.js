"use strict";

var alive = require("../routes/alive.js");
var revision = require("../routes/revision.js");

module.exports = function routes(app) {

  app.get("/_alive", alive);
  app.head("/_alive", alive);

  app.get("/_revision", revision);
  app.head("/_revision", revision);

  app.get("/", function (req, res) {
    res.send("<html><body style='background: blue'><h1 style='color: white'>Hello from dockerized node starterapp revision " + process.env.VERSION + "!</h1></body></html>");
  });

};
