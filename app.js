// In app.js
var express = require("express");
var app = express();
var logger = require("./lib/logger.js");
var packageInfo = require("./package.json");

// Don't limit outgoing HTTP requests
require("http").globalAgent.maxSockets = Infinity;
require("https").globalAgent.maxSockets = Infinity;


module.exports = app; // Expose app to tests

// Only listen if started, not if included
if (require.main === module) {
  var port = Number(process.env.PORT) || 3000;
  var server = app.listen(port, function () {
    logger.info("%s listening on port %d", packageInfo.name, server.address().port);
  });
}