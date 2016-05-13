"use strict";
const config = require("exp-config");

//noinspection JSLastCommaInArrayLiteral
const knownToggles = [
  "exampleFeature1",          // Since 2014-05-02
  "exampleFeature2"           // Since 2014-05-22
];
// Include trailing comma so that each new toggle only changes 1 line of code

knownToggles.sort();

config.toggle = config.toggle || {};

function toggle(name) {
  if (knownToggles.indexOf(name) === -1) {
    throw new Error(`Unknown toggle '${name}'`);
  }
  if (process.env.NODE_ENV === "test") {
    return true;
  }
  const value = config.toggle[name];
  return value === true || value === "true";
}

toggle.knownToggles = knownToggles;

module.exports = toggle;
