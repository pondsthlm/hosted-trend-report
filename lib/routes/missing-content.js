"use strict";
const config = require("exp-config");
const fetch = require("../helpers/fetch");

function missingContent(req, res) {
  fetch(`${config.flotsamUrl}/resolveUrl/404`).then((source) => {
    const channel = (req.locals && req.locals.channel) ? req.locals.channel : "";
    source.headline = "Videon kunde inte hittas";
    res.status(404);
    res.render("404", source);

  });
}

module.exports = missingContent;
