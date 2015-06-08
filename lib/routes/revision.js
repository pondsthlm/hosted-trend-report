"use strict";
var fs = require("fs");
var path = require("path");

function revision(req, res) {
  fs.readFile(path.join(__dirname, "..", "..", "config", "_revision"), "utf-8", function (err, revision) {
    if (err) return res.status(404).end();

    return res.send(revision);
  });
}

module.exports = revision;
