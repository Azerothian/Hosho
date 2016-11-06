import socketClusterClient, {SCSocket} from "socketcluster-client";
import Promise from "bluebird";
//TODO add proper tracking for events with subscriptions
Promise.promisifyAll(SCSocket.prototype);

import vars from "./vars";

export default class Client {
  constructor({hostname, port}) {
    this.client = socketClusterClient.connect({hostname, port});
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
    return this.client.disconnect();
  }
}
