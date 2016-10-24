import path from "path";
import {startSocketCluster} from "utils/sc";
import logger from "utils/logger";
import config from "config";
import client from "./client";
const log = logger("hosho:agent:index:");
import sourceMapSupport from "source-map-support";
sourceMapSupport.install();

startSocketCluster(Object.assign({
  workerController: path.join(__dirname, "worker.js"),
  brokerController: path.join(__dirname, "broker.js"),
}, config.server)).then((socketCluster) => {
  log.info("hosho agent has started");
  return client(socketCluster);
});


// // import logger from "utils/logger";
// // import socketClusterClient from "socketcluster-client";
// // import config from "config";
// // const log = logger("hosho:agent:index:");
// log.info("socketcluster client connecting", config.master);
// const socket = socketClusterClient.connect(config.master);
// socket.on("connect", () => {
//   log.info("socketcluster client connected");
// });
