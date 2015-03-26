"use strict";

var fs = require("fs");
var path = require("path");
var request = require("supertest");
var app = require("../../");

Feature("_revision", function () {
  var revisionFilePath = path.join(__dirname, "..", "..", "config", "_revision");

  Scenario("Getting revision when it is there", function () {
    Given("The file config/_revision exists", function (done) {
      fs.writeFile(revisionFilePath, "some-revision", done);
    });
    When("Requesting /_revision will return 200 and the revision from the file", function (done) {
      request(app)
        .get("/_revision")
        .expect(200)
        .expect("some-revision")
        .end(done);
    });
  });

  Scenario("Getting revision when it is not there", function () {
    Given("The file config/_revision has been removed", function (done) {
      fs.unlink(revisionFilePath, done);
    });
    When("Requesting /_revision will return 404 Not Found", function (done) {
      request(app)
        .get("/_revision")
        .expect(404)
        .end(done);
    });
  });
});
