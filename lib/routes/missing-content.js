"use strict";
const config = require("exp-config");
const fetch = require("../helpers/fetch");

function missingContent(req, res) {
  res.render("404", {});

}

module.exports = missingContent;
