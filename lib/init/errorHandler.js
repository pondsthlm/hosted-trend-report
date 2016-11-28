"use strict";

const logger = require("../logger");

function errorHandler(err, req, res, next) {
  if (!err) return next();
  logger.error("errorHandler:", err);

  res.status(500).send({
    error: err.message
  });
}

module.exports = errorHandler;
