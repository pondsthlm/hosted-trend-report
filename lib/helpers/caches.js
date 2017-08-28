
"use strict";

const config = require("exp-config");
const initLRUCache = require("exp-fetch").initLRUCache;
const AsyncCache = require("exp-asynccache");

const cache = new AsyncCache(initLRUCache(config.contentCache));

module.exports = cache;
