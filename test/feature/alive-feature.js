// jshint newcap: false

var fs = require("fs");
var path = require("path");
var request = require("supertest");
var app = require("../../");

Feature("_alive", function () {
  var aliveFilePath = path.join(__dirname, "..", "..", "config", "_alive");

  Scenario("Basic alive check", function () {
    Given("The file config/_alive exists", function (done) {
      fs.exists(aliveFilePath, function (exists) {
        if (!exists) return done(new Error(aliveFilePath + " does not exist!"));

        return done();
      });
    });
    When("Requesting /_alive will return 200 Yes", function (done) {
      request(app)
        .get("/_alive")
        .expect(200)
        .expect("Yes")
        .end(done);
    });
  });

  Scenario("Preparing to shutdown", function () {
    var fileData;
    before(function (done) {
      fs.readFile(aliveFilePath, function (err, data) {
        if (err) return done(err);
        fileData = data;
        done();
      });
    });
    after(function (done) {
      fs.writeFile(aliveFilePath, fileData, done);
    });

    Given("The file config/_alive has been removed", function (done) {
      fs.unlink(aliveFilePath, done);
    });
    When("Requesting /_alive will return 404 No", function (done) {
      request(app)
        .get("/_alive")
        .expect(404)
        .expect("No")
        .end(done);
    });
  });
});
