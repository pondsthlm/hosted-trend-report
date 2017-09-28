"use strict";
const fetch = require("../helpers/fetch");
const config = require("exp-config");
function iframeRoute(req, res, next) {
  const contentUrl = `${config.flotsamUrl}/resolveUrl/${req.params.externalPath}`;
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

    const query = Object.assign({}, {
      abTestClass: req.query.hasOwnProperty("abTestClass") ? req.query.abTestClass : undefined,
      autoPlay: (req.query.hasOwnProperty("autoplay") && req.query.external === "true") ? true : undefined,
      channel: req.query.hasOwnProperty("channel") ? req.query.channel : undefined,
      deviceType: req.query.hasOwnProperty("deviceType") ? req.query.deviceType : undefined,
      external: (req.query.hasOwnProperty("external") && req.query.external === "true") ? true : undefined,
      partnerId: req.query.hasOwnProperty("partnerId") ? req.query.partnerId : undefined,
      startNextVideo: (req.query.hasOwnProperty("startNextVideo") && req.query.startNextVideo === "true") ? true : undefined,
      starttime: req.query.hasOwnProperty("starttime") ? parseInt(req.query.starttime) : undefined,
      startVolume: req.query.hasOwnProperty("startVolume") ? parseFloat(req.query.startVolume) : undefined,
      topBar: (req.query.hasOwnProperty("topbar") && req.query.topbar === "true") ? true : undefined,
    });

    for (var key in query) {
      if (query[key] === undefined) {
        delete query[key];
        continue;
      }
    }

    const data = {
      query,
      source
    }

    return res.render("iframe", data);
  }, (reason) => {
    console.log("HANDLE TIMEOUT", reason);
  });
}

module.exports = iframeRoute;
