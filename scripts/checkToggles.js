#!/usr/bin/env node

"use strict";
var _ = require("lodash");
var environmentNames = ["development", "epitest", "epistage", "livedata", "production"];

var environments = environmentNames.map(function (envName) {
  return require("../config/" + envName);
});

_.each(environments[0].toggle, function (value, toggle) {
  if (environments.every(function (environment) {
    return !!environment.toggle[toggle];
  })) {
    console.log("%s is turned on in all environments, time to remove?", toggle);
  }
});
