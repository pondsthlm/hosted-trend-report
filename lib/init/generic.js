"use strict";

module.exports = function () {
  // Don't limit the number of outgoing HTTP requests (defaults to 4 simultaneous requests)
  var http = require("http");
  var https = require("https");
  http.globalAgent.maxSockets = Infinity;
  https.globalAgent.maxSockets = Infinity;

  // Make sure dates are displayed in the correct timezone
  process.env.TZ = "Europe/Stockholm";
};
