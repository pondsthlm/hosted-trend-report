"use strict";

const fs = require("fs");
const path = require("path");

const configDir = path.join(__dirname, "..", "..", "config");

describe("config", () => {
  fs.readdirSync(configDir).forEach((file) => {
    if (!file.match(/\.json$/)) return;

    it(`${file} is valid JSON`, () => {
      require(path.join(configDir, file));
    });
  });
});
