var fs = require("fs");
var path = require("path");

var configDir = path.join(__dirname, "..", "..", "config");

describe("config", function () {
  fs.readdirSync(configDir).forEach(function (file) {
    if (!file.match(/\.json$/)) return;

    it(file + " is valid JSON", function () {
      require(path.join(configDir, file));
    });
  });
});
