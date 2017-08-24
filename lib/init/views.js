"use strict";

const expressHandlebars = require("express-handlebars");

module.exports = function (app) {
  const hbs = expressHandlebars.create({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {}
  });

  app.engine(".hbs", hbs.engine);
  app.set("view engine", ".hbs");
};
