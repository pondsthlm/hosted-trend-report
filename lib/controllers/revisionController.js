"use strict";
var revisionController = {};
var fs = require("fs");
var path = require("path");

revisionController.index = function (req, res) {
  fs.readFile(path.join(__dirname, "..", "..", "config", "revision"), "utf-8", function (err, revision) {
    if (err) return res.status(404).end();

    return res.send(revision);
  });
};

module.exports = revisionController;
