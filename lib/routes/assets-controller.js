"use strict";
const fetch = require("../helpers/fetch");
const config = require("exp-config");
function iframeRoute(req, res, next) {
  const contentUrl = `${config.flotsamUrl}/${req.params.internalPath}`;
  const timeout = new Promise((resolve, reject) => {
    setTimeout(reject, 1000, "timeout");
  });
  const content = fetch(contentUrl);
  Promise.race([content, timeout]).then((source) => {
    if (!source) {
      //logger.info("404 handling request for '%s'", req.originalUrl);
      return next();
    }

    if (source.type !== "webtv-article") {
      //logger.info("Unsupported content type '%s'", source.type);
      return next();
    }

    return res.json(source);
  }, (reason) => {
    console.log("HANDLE TIMEOUT", reason);
  });
}

module.exports = iframeRoute;
