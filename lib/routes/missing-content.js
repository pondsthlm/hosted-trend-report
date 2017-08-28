"use strict";
const config = require("exp-config");
const fetch = require("../helpers/fetch");
const Promise = require("bluebird");

function missingContent(req, res) {
  const promises = {};
  promises.page = fetch(`${config.flotsamUrl}/resolveUrl/404`);
  Promise.props(promises).then(() => {
    const channel = (req.locals && req.locals.channel) ? req.locals.channel : "";
    res.status(404);
    res.json({});

  });
}

module.exports = missingContent;
