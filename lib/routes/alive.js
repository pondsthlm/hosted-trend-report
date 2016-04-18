"use strict";
const fs = require("fs");
const path = require("path");

function alive(req, res) {
  // Server is only included in load balancing as long as this endpoint returns 200.
  fs.exists(path.join(__dirname, "..", "..", "config", "_alive"), (exists) => {
    if (exists) {
      res.status(200).send("Yes");
    } else {
      res.status(404).send("No");
    }
  });
}

module.exports = alive;
