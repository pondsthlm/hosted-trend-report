"use strict";
var fs = require("fs");
var logger = require("../../lib/logger.js");
var path = require("path");

describe("logger", function () {
  it("logs to file in tests", function (done) {
    logger.debug("testing logger");

    setImmediate(function () {
      fs.readFileSync(path.join(__dirname, "/../../logs/test.log"), "utf-8").should.include("testing logger");
      done();
    });
  });
});
