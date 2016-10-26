import logger from "utils/logger";
import socketClusterClient from "socketcluster-client";
import config from "config";
import Promise from "bluebird";
import cmd from "./cmd";
const log = logger("hosho:agent:index:");
//TODO: move all this into the broker

export default function client(server) {
  server.on("ready", (app) => {
    log.info("socketcluster client connecting", {hostname: "localhost", port: config.port});
    const socket = Promise.promisifyAll(socketClusterClient.connect({hostname: "localhost", port: config.port}));
    // socket.on("agent:message", (message) => {
    //   log.info("client message", message);
    // });
    socket.on("connect", () => {
      log.info("socketcluster client connected");
      socket.subscribe(`agent:${config.id}`);
      return cmd(socket);
    });
    socket.on(`agent:${config.id}`, (message) => {
      log.info("agent message recieved", message);
    });
  });
}
