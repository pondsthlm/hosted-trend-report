"use strict";

const nock = require("nock");
const config = require("exp-config");

nock.disableNetConnect();
nock.enableNetConnect(/(localhost|127\.0\.0\.1):\d+/);

function FakeApi(baseUrl) {
  this.baseUrl = baseUrl;
  this.api = nock(baseUrl);
}

FakeApi.prototype._normalizePath = function (apiPath) {
  if (apiPath.indexOf(this.baseUrl) === 0) {
    apiPath = apiPath.replace(this.baseUrl, "");
  }
  return apiPath;
};

FakeApi.prototype.fakeRedirect = function (apiPath, destination, body, times) {
  body = body || "";
  this.api.get(this._normalizePath(apiPath)).times(times || 1).reply(301, body, {
    location: destination
  });
};

FakeApi.prototype.fakeResource = function (content, times) {
  this.fakeJsonResponse(content.self, content, times);
};

FakeApi.prototype.fakeResources = function () {
  // Don't touch this, see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
  for (let i = 0; i < arguments.length; ++i) {
    //i is always valid index in the arguments object
    this.fakeResource(arguments[i]);
  }
  // End of don't touch
};

FakeApi.prototype.fakeJsonResponse = function (apiPath, content, times) {
  times = times || 1;

  this.api.get(this._normalizePath(apiPath)).times(times).reply(200, content);
};

FakeApi.prototype.fakeNotExisting = function (apiPath, body) {
  body = body || {};
  this.api.get(this._normalizePath(apiPath)).reply(404, body);
};

FakeApi.prototype.fakeError = function (apiPath, body) {
  body = body || {};
  this.api.get(this._normalizePath(apiPath)).reply(500, body);
};

FakeApi.prototype.hasPendingCall = function (apiPath) {
  const pending = this.api.pendingMocks();
  return pending.reduce((sum, request) => {
    if (apiPath === request) {
      sum++;
    }
    return sum;
  }, 0) !== 0;
};

FakeApi.prototype.reset = function () {
  nock.cleanAll();
  this.api = nock(this.baseUrl);
};

module.exports = new FakeApi(config.flotsamUrl);
module.exports.proxy = new FakeApi("http://other-site:80");
