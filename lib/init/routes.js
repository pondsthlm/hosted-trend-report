var aliveController = require("../controllers/aliveController.js");
var revisionController = require("../controllers/revisionController.js");

module.exports = function routes(app) {

  app.get("/_alive", aliveController.index);
  app.head("/_alive", aliveController.index);

  app.get("/_revision", revisionController.index);
  app.head("/_revision", revisionController.index);

  app.get("/", function (req, res) {
    res.send("Hello from node starterapp!");
  });

};
