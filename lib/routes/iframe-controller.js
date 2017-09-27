"use strict";
const fetch = require("../helpers/fetch");
const config = require("exp-config");
function iframeRoute(req, res, next) {
  const contentUrl = `${config.flotsamUrl}/resolveUrl/${req.params.externalPath}`;
  const timeout = new Promise((resolve, reject) => {
    setTimeout(reject, 1000, "timeout");
  });
  const content = fetch(contentUrl);
  console.log(req.query);
  Promise.race([content, timeout]).then((source) => {
    if (!source) {
      //logger.info("404 handling request for '%s'", req.originalUrl);
      return next();
    }

    if (source.type !== "webtv-article") {
      //logger.info("Unsupported content type '%s'", source.type);
      return next();
    }

    const data = {
      query: req.query,
      source
    }

    return res.render("iframe", data);
  }, (reason) => {
    console.log("HANDLE TIMEOUT", reason);
  });
}

module.exports = iframeRoute;
