"use strict";
const fetch = require("../helpers/fetch");
const config = require("exp-config");
function demoController(req, res, next) {
  const contentUrl = `${config.flotsamUrl}/resolveUrl/nyheter/magda-gads-dagbok-fran-raqqa/`;
  const timeout = new Promise((resolve, reject) => {
    setTimeout(reject, 10000, "timeout");
  });
  const content = fetch(contentUrl);
  Promise.race([content, timeout]).then((source) => {
    if (!source) {
      //logger.info("404 handling request for '%s'", req.originalUrl);
      return next();
    }

    return res.render("demo", source);
  }, (reason) => {
    console.log("HANDLE TIMEOUT", reason);
  });
}

module.exports = demoController;
