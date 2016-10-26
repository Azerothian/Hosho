
import logger from "utils/logger";
import socketClusterClient from "socketcluster-client";
import config from "config";
import Promise from "bluebird";
const log = logger("hosho:agent:broker:");

export function run(broker) {
  log.info(" >> Broker PID:", process.pid);
  if (config.master.hostname && config.master.port) {
    log.info("socketcluster client connecting", config.master);
    const client = Promise.promisifyAll(socketClusterClient.connect(config.master));
    client.on("connect", () => {
      log.info(`subscribing to event agent:${config.id}`);
      client.subscribe(`agent:${config.id}`);
    });
    client.on("message", (packet) => {
      if (packet.indexOf("{") > -1) {
        const d = JSON.parse(packet);
        if (d.event) {
          broker.publish(d.event, d.data);
        }
      }
    });
    broker.on("subscribe", (channelName) => {
      log.info("broker - subscribe", {channelName});
      return client.subscribe(channelName);
    });
    broker.on("unsubscribe", (channelName) => {
      log.info("broker - unsubscribe", {channelName});
      return client.unsubscribe(channelName);
    });
    broker.on("publish", (channelName, message) => {
      log.info("broker - publish", {channelName});
      if (channelName !== `agent:${config.id}`) { // no need to resend is already here
        return client.emit("publish", {event: channelName, data: message});
      }
      return undefined;
    });
  }
  broker.on("message", (packet) => {
    log.info("broker - message", {packet});
  });
}

// import logger from "utils/logger";
// import socketClusterClient from "socketcluster-client";
// import config from "config";
// import Promise from "bluebird";
// import cmd from "./cmd";
// const log = logger("hosho:agent:index:");
// //TODO: move all this into the broker

// export default function client(server) {
//   server.on("ready", (app) => {
//     server.on("workerMessage", (workerId, message) => {
//       log.info("workerMessage", {workerId, message});
//     });
//     log.info("socketcluster client connecting", config.master);
//     const socket = Promise.promisifyAll(socketClusterClient.connect(config.master));
//     socket.on("agent:message", (message) => {
//       log.info("client message", message);
//     });
//     socket.on("connect", () => {
//       log.info("socketcluster client connected");
//       socket.emitAsync("agent:register", {"id": config.id, connected: []}).then((success) => {
//         log.info("register", success);
//         return cmd(socket);
//         // socket.emit("agent:message", {source: "33333", target: "33333", message: "hi"});
//         // socket.emit("agent:message", {source: "33333", target: "1234567890", message: "h22"});
//       });
//     });
//   });
// }
