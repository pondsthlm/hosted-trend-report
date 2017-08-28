"use strict";
const fetch = require("../helpers/fetch");
const config = require("exp-config");
function iframeRoute(req, res, next) {
  const contentUrl = `${config.flotsamUrl}/resolveUrl/${req.params.externalPath}`;
  fetch(contentUrl).then((source) => {
    if (!source) {
      //logger.info("404 handling request for '%s'", req.originalUrl);
      return next();
    }

    if (source.type !== "webtv-article") {
      //logger.info("Unsupported content type '%s'", source.type);
      return next();
    }

    return res.render("iframe", source);
  });
}

module.exports = iframeRoute;
