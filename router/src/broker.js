
import logger from "utils/logger";
import socketClusterClient from "socketcluster-client";
import config from "config";
import Promise from "bluebird";
const log = logger("hosho:router:broker:");

export function run(broker) {
  log.info(" >> Broker PID:", process.pid);
  if (config.master.hostname && config.master.port) {
    log.info("socketcluster client connecting", config.master);
    const client = Promise.promisifyAll(socketClusterClient.connect(config.master));
    client.on("connect", () => {
      log.info(`subscribing to event router:${config.id}`);
      client.subscribe(`router:${config.id}`);
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
      if (channelName !== `router:${config.id}`) { // no need to resend is already here
        return client.emit("publish", {event: channelName, data: message});
      }
      return undefined;
    });
  }
  broker.on("message", (packet) => {
    log.debug("message", {packet});
  });
}
