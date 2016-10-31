import path from "path";
import {startSocketCluster} from "utils/sc";
import logger from "utils/logger";
import config from "config";
// import client from "./client";
const log = logger("hosho:router:index:");
import sourceMapSupport from "source-map-support";
sourceMapSupport.install();


startSocketCluster(Object.assign({
  workerController: path.join(__dirname, "worker.js"),
  brokerController: path.join(__dirname, "broker.js"),
  masterController: path.join(__dirname, "master.js"),
}, config.server)).then((socketCluster) => {
  log.info("hosho router has started");
  // return client(socketCluster);
});
