"use strict";
const config = require("exp-config");
function demoController(req, res, next) {
  return res.render("demo", {});
}

module.exports = demoController;
