"use strict";
const async = require("async");
const _ = require("lodash");

function getStatus(req, res, next) {
  async.parallel({
    service1: checkService1,
    service2: checkService2
  }, (err, results) => {
    if (err) return next(err);

    const status = _.any(results, (val) => val instanceof Error) ? 500 : 200;

    return res.status(status).json({
      services: _.mapValues(results, (val) => {
        if (!val) return "OK";
        return val.message || val;
      })
    });
  });
}

function checkService1(callback) {
  setImmediate(() => callback(null, "All is good"));
}

function checkService2(callback) {
  setImmediate(() => callback(null, new Error("Trouble with service 2")));
}

module.exports = getStatus;
