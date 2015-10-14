"use strict";

var config = require("exp-config");
var cluster = require("cluster");
var os = require("os");
var logger = require("./lib/logger.js");
var packageInfo = require("./package.json");

cluster.setupMaster({
  exec: __dirname
});

var workerCount = config.boolean("cluster") ? config.clusterWorkers || os.cpus().length : 1;
logger.info("Starting %s cluster with %d workers", packageInfo.name, workerCount);
for (var i = 0; i < workerCount; i++) {
  cluster.fork(workerEnv(i + 1)).originalId = i + 1;
}

cluster.on("exit", function (deadWorker, code, signal) {
  logger.warning("Worker %s died (code: %d, signal: %s, originalId: %d)", deadWorker.process.pid, code, signal, deadWorker.originalId);

  var worker = cluster.fork(workerEnv(deadWorker.originalId));
  worker.originalId = deadWorker.originalId;

  logger.info("Worker %s was born (originalId: %d)", worker.process.pid, deadWorker.originalId);
});

function workerEnv(originalId) {
  return {
    NODE_TIME: originalId <= 2
  };
}
