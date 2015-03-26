"use strict";

var fs = require("fs");
var logger = require("../../lib/logger.js");

describe("logger", function () {
  it("logs to file in tests", function () {
    logger.debug("testing logger");
    fs.readFileSync(__dirname + "/../../logs/test.log", "utf-8").should.include("testing logger");
  });
});
