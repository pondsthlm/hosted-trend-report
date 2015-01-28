// In app.js
var logger = require("./lib/logger.js");
var packageInfo = require("./package.json");

var setupApp = require("./lib/init/setupApp.js");
var app = setupApp();

module.exports = app; // Expose app to tests

// Only listen if started, not if included
if (require.main === module) {
  var port = Number(process.env.PORT) || 3000;
  var server = app.listen(port, function () {
    logger.info("%s listening on port %d", packageInfo.name, server.address().port);
  });
}
