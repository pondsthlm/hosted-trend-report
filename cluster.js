"use strict";

const config = require("exp-config");
const cluster = require("cluster");
const os = require("os");
const logger = require("./lib/logger.js");
const packageInfo = require("./package.json");

cluster.setupMaster({
  exec: __dirname
});

const workerCount = config.boolean("cluster") ? config.clusterWorkers || os.cpus().length : 1;
logger.info("Starting %s cluster with %d workers", packageInfo.name, workerCount);
for (let i = 0; i < workerCount; i++) {
  cluster.fork(workerEnv(i + 1)).originalId = i + 1;
}

cluster.on("exit", (deadWorker, code, signal) => {
  logger.warning("Worker %s died (code: %d, signal: %s, originalId: %d)", deadWorker.process.pid, code, signal, deadWorker.originalId);

  const worker = cluster.fork(workerEnv(deadWorker.originalId));
  worker.originalId = deadWorker.originalId;

  logger.info("Worker %s was born (originalId: %d)", worker.process.pid, deadWorker.originalId);
});

function workerEnv(originalId) {
  return {
    NODE_TIME: originalId <= 2
  };
}
