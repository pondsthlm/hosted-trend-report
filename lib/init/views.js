"use strict";

const exphbs = require("express-handlebars");

module.exports = function (app) {
  const hbs = exphbs.create({
    defaultLayout: "main",
    helpers: {}
  });

  app.engine("handlebars", hbs.engine);
  app.set("view engine", "handlebars");
};
