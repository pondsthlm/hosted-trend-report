"use strict";

const fs = require("fs");
const path = require("path");
const request = require("supertest");
const app = require("../../");

Feature("_alive", () => {
  const aliveFilePath = path.join(__dirname, "..", "..", "config", "_alive");

  Scenario("Basic alive check", () => {
    Given("The file config/_alive exists", (done) => {
      fs.exists(aliveFilePath, (exists) => {
        if (!exists) return done(new Error(aliveFilePath + " does not exist!"));

        return done();
      });
    });
    When("Requesting /_alive will return 200 Yes", (done) => {
      request(app)
        .get("/_alive")
        .expect(200)
        .expect("Yes")
        .end(done);
    });
  });

  Scenario("Preparing to shutdown", () => {
    let fileData;

    before((done) => {
      fs.readFile(aliveFilePath, (err, data) => {
        if (err) return done(err);
        fileData = data;
        return done();
      });
    });
    after((done) => {
      fs.writeFile(aliveFilePath, fileData, done);
    });

    Given("The file config/_alive has been removed", (done) => {
      fs.unlink(aliveFilePath, done);
    });
    When("Requesting /_alive will return 404 No", (done) => {
      request(app)
        .get("/_alive")
        .expect(404)
        .expect("No")
        .end(done);
    });
  });
});
