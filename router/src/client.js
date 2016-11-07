
import socketClusterClient from "utils/sc-client";
import Promise from "bluebird";

import logger from "utils/logger";
const log = logger("hosho:router:client:");
//TODO add proper tracking for events with subscriptions

import vars from "./vars";

export default class Client {
  constructor({hostname, port}) {
    this.client = socketClusterClient.connect({hostname, port});
    this.client.on("error", this.reportError);
  }
  reportError(e) {
    log.error("socket error", e);
  }
  on(eventName, f) {
    this.client.on(eventName, f);
    this.client.subscribe(eventName);
  }
  off(eventName, f) {
    this.client.off(f);
    this.client.unsubscribe(eventName);
  }
  emit(routerId, eventName, message) {
    return this.client.emit("publish", {
      event: vars.socket.sendMessage,
      data: {
        target: routerId,
        event: eventName,
        data: message,
      },
    });
  }
  disconnect() {
    return new Promise((resolve, reject) => { //TODO: check socket state, and catch errors
      this.client.on("disconnect", resolve);
      return this.client.disconnect();
    });

  }
}
