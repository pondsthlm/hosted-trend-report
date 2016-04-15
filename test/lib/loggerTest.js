"use strict";
const fs = require("fs");
const logger = require("../../lib/logger.js");
const path = require("path");

describe("logger", () => {
  it("logs to file in tests", (done) => {
    logger.debug("testing logger");

    setImmediate(() => {
      fs.readFileSync(path.join(__dirname, "../../logs/test.log"), "utf-8").should.include("testing logger");
      done();
    });
  });
});
