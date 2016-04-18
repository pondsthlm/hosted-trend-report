"use strict";
const fs = require("fs");
const path = require("path");

function revision(req, res) {
  fs.readFile(path.join(__dirname, "..", "..", "config", "_revision"), "utf-8", (err, rev) => {
    if (err) return res.status(404).end();

    return res.send(rev);
  });
}

module.exports = revision;
