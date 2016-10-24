import logger from "utils/logger";
import socketClusterClient from "socketcluster-client";
import config from "config";
import Promise from "bluebird";
import cmd from "./cmd";
const log = logger("hosho:agent:index:");
//TODO: move all this into the broker

export default function client(server) {
  server.on("ready", (app) => {
    server.on("workerMessage", (workerId, message) => {
      log.info("workerMessage", {workerId, message});
    });
    log.info("socketcluster client connecting", config.master);
    const socket = Promise.promisifyAll(socketClusterClient.connect(config.master));
    socket.on("agent:message", (message) => {
      log.info("client message", message);
    });
    socket.on("connect", () => {
      log.info("socketcluster client connected");
      socket.emitAsync("agent:register", {"id": config.id, connected: []}).then((success) => {
        log.info("register", success);
        return cmd(socket);
        // socket.emit("agent:message", {source: "33333", target: "33333", message: "hi"});
        // socket.emit("agent:message", {source: "33333", target: "1234567890", message: "h22"});
      });
    });
  });
}
