"use strict";


const uiReducer = require("../../app/ui/reducer").default;

function scenarioSetup() {

  console.log("---->", uiReducer(undefined, {}));
}

Feature("When requesting", () => {

  Scenario("an existing video", () => {
    before(() => {
    });
    after(() => {
    });
    Given("The api is ready to respond", () => {
      scenarioSetup();
    });

    When("the request is sent", () => {

    });

    And("flotsam has 404 page", () => {
    });

    Then("The title should be set", () => {

    });
  });

});
