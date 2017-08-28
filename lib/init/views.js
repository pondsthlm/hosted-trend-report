"use strict";

const expressHandlebars = require("express-handlebars");
const handlebarHelpers = require("../../views/handlebars-helpers.js");

module.exports = function (app) {
  const hbs = expressHandlebars.create({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: handlebarHelpers
  });

  app.engine(".hbs", hbs.engine);
  app.set("view engine", ".hbs");
};
