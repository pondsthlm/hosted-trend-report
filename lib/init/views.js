"use strict";

const cacheBuster = require("../cacheBuster");
const config = require("exp-config");

module.exports = function (app) {
  // Expose bust function to views
  app.locals.bust = cacheBuster.bust;

  // Setup view engine and view directory here like this:
  //app.engine('jade', require('jade').__express);
  app.set("view cache", config.boolean("viewCaching"));
};
