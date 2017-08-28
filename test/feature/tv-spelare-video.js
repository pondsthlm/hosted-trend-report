"use strict";


const app = require("../../");
const cheerio = require("cheerio");
const fakeApi = require("../helpers/fakeApi");
const request = require("supertest");

const mockedFlotsamVideoArticleData = require("../mockData/webtv-article.json");
const response404 = require("../mockData/404.json");

const bundleSettings = {};
const notFound = {};

function scenarioSetup() {

  fakeApi.reset();
  fakeApi.fakeJsonResponse(
    "/resolveUrl/tv/nyheter/inrikes/mystiska-besoket-i-grishagen/",
    mockedFlotsamVideoArticleData
  );
  fakeApi.fakeJsonResponse(
    "/resolveUrl/404",
    response404
  );
}

Feature("When requesting", () => {
  let response;
  let $;

  Scenario("an existing video", () => {
    Given("The api is ready to respond", () => {
      scenarioSetup();
    });

    When("the request is sent", (done) => {
      request(app)
        .get("/tvspelare/video/tv/nyheter/inrikes/mystiska-besoket-i-grishagen/")
        .set("Cookie", ["channel=desktop"])
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          $ = cheerio.load(res.text);
          done();
        });
    });

    Then("The title should be set", () => {
      $("title").text().should.eql("Kvinnan dansar ensam på gatan - då rycker polisen in");
    });
  });

  Scenario("a non-existing video", () => {
    before(() => {
      fakeApi.reset();
    });
    after(() => {
      fakeApi.reset();
    });

    Given("the video does not exist", () => {
      fakeApi.fakeJsonResponse("/settings/bundle-settings", bundleSettings);
      fakeApi.fakeNotExisting("/resolveUrl/does-not-exist");
    });

    And("flotsam has 404 page", () => {
      fakeApi.fakeRedirect("/resolveUrl/404", "http://flotsamurl/static/404", {}, 1);
      fakeApi.fakeJsonResponse("/static/404", notFound);
    });

    When("the request is sent", (done) => {
      request(app)
        .get("/tvspelare/video/does-not-exist")
        .set("Cookie", ["channel=desktop"])
        .end((err, res) => {
          response = res;
          if (err) return done(err);
          done();
        });
    });

    Then("we should get a 404 with title 'Videon kunde inte hittas'", () => {
      response.statusCode.should.eql(404);
      $ = cheerio.load(response.text);
      $("title").text().should.eql("Videon kunde inte hittas");
    });
  });

  Scenario("a random URL", () => {
    Given("The api is ready to respond", () => {
      scenarioSetup();
      fakeApi.fakeRedirect("/resolveUrl/404", "http://flotsamurl/static/404", {}, 1);
      fakeApi.fakeJsonResponse("/static/404", notFound);
    });

    When("the request is sent", (done) => {
      request(app)
        .get("/badURL")
        .end((err, res) => {
          response = res;
          if (err) return done(err);
          done();
        });
    });

    Then("we should get a 404 with title 'Videon kunde inte hittas'", () => {
      response.statusCode.should.eql(404);
      $ = cheerio.load(response.text);
      $("title").text().should.eql("Videon kunde inte hittas");
    });
  });

});
