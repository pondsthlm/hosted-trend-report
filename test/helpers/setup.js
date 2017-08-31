"use strict";

const chai = require("chai");
const nock = require("nock");
const jsdom = require("jsdom");
const ignorewStyles = require("ignore-styles");
const { JSDOM } = jsdom;
const { document } = (new JSDOM("")).window;

ignorewStyles.default([".styl", ".css"]);

global.document = document;
global.window = document.defaultView;

nock.enableNetConnect(/(localhost|127\.0\.0\.1):\d+/);

// Make sure dates are displayed in the correct timezone
process.env.TZ = "Europe/Stockholm";

// Tests should always run in test environment to prevent accidental deletion of
// real elasticsearch indices etc.
// This file is required with ./test/mocha.opts
process.env.NODE_ENV = "test";

chai.config.truncateThreshold = 0;
chai.config.includeStack = true;

chai.should();
