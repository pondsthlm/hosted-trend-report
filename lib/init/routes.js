var aliveController = require("../controllers/aliveController.js");

module.exports = function routes(app) {

  app.get("/_alive", aliveController.index);
  app.head("/_alive", aliveController.index);

};
