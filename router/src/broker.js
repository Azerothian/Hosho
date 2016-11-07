
import logger from "utils/logger";
import socketClusterClient from "utils/sc-client";
import config from "config";

const log = logger(`hosho:router[${config.id}]:broker:`);

import vars from "./vars";
//TODO: only publish and subscribe "router:{id}"

export function run(broker) {
  log.info(" >> Broker PID:", process.pid);
  if (config.enableBroker) {
    log.info("socketcluster client connecting", config.master);
    const client = socketClusterClient.connect(config.master);
    process.on("SIGTERM", () => {
      client.disconnect(4501);
    });
    client.on("connect", () => {
      log.info(`subscribing to event '${vars.socket.currentChannel}'`);
      return client.subscribe(vars.socket.currentChannel);
    });
    client.on("error", (e) => {
      log.info("socket error", e.message);
    });
    client.on("message", (packet) => {
      if (packet.indexOf("{") > -1) {
        const d = JSON.parse(packet);
        if (d.event) {
          return broker.publish(d.event, d.data);
        }
      }
      return undefined;
    });
    broker.on("subscribe", (channelName) => {
      if (channelName.indexOf(vars.socket.channel) === 0) {
        log.info("broker - subscribe", {channelName});
        return client.subscribe(channelName);
      }
      return undefined;
    });
    broker.on("unsubscribe", (channelName) => {
      if (channelName.indexOf(vars.socket.channel) === 0) {
        log.info("broker - unsubscribe", {channelName});
        return client.unsubscribe(channelName);
      }
      return undefined;
    });
    broker.on("publish", (channelName, message) => {
      if (channelName.indexOf(vars.socket.channel) === 0 && channelName !== vars.socket.currentChannel) { // no need to resend is already here
        log.info("broker - publish", {channelName});
        return client.emit("publish", {event: channelName, data: message});
      }
      return undefined;
    });
  }
  // broker.on("message", (packet) => {
  //   log.debug("message", {packet});
  // });
}
