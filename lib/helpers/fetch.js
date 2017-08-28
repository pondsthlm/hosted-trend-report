"use strict";

const buildFetch = require("exp-fetch");
const logger = require("../logger.js");
const cache = require("./caches.js");

module.exports = buildFetch({
  freeze: false,
  clone: false,
  cache: cache,
  errorOnRemoteError: false,
  logger: logger
}).fetch;
