#!/usr/bin/env node
"use strict";
/*eslint-disable no-console */

const _ = require("lodash");
const environmentNames = ["development", "epitest", "epistage", "livedata", "production"];

const environments = environmentNames.map((envName) => require(`../config/${envName}`));

_.each(environments[0].toggle, (value, toggle) => {
  if (environments.every((environment) => !!environment.toggle[toggle])) {
    console.log("%s is turned on in all environments, time to remove?", toggle); //eslint-disable-line no-console
  }
});
