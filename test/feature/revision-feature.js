"use strict";

const fs = require("fs");
const path = require("path");
const request = require("supertest");
const app = require("../../");

Feature("_revision", () => {
  const revisionFilePath = path.join(__dirname, "..", "..", "config", "_revision");

  Scenario("Getting revision when it is there", () => {
    Given("The file config/_revision exists", (done) => {
      fs.writeFile(revisionFilePath, "some-revision", done);
    });
    When("Requesting /_revision will return 200 and the revision from the file", (done) => {
      request(app)
        .get("/_revision")
        .expect(200)
        .expect("some-revision")
        .end(done);
    });
  });

  Scenario("Getting revision when it is not there", () => {
    Given("The file config/_revision has been removed", (done) => {
      fs.unlink(revisionFilePath, done);
    });
    When("Requesting /_revision will return 404 Not Found", (done) => {
      request(app)
        .get("/_revision")
        .expect(404)
        .end(done);
    });
  });
});
