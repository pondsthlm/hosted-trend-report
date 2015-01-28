"use strict";
var aliveController = {};
var fs = require("fs");
var path = require("path");

aliveController.index = function (req, res) {
  // Server is only included in load balancing as long as this endpoint returns 200.
  fs.exists(path.join(__dirname, "..", "..", "config", "alive"), function (exists) {
    if (exists) {
      res.status(200).send("Yes");
    } else {
      res.status(404).send("No");
    }
  });
};

module.exports = aliveController;
