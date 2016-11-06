import logger from "utils/logger";
import config from "config";
// import config from "config";

//TODO: Authentication of clients

const log = logger(`hosho:router[${config.id}]:worker:${process.pid}:`);
export function run(host) {
  log.info("loading worker..");
  const {scServer} = host;
  scServer.on("connection", (socket) => {
    log.info("router connected");
    const channels = {};
    socket.on("subscribe", (channelName) => {
      log.info(`subscribing client to ${channelName}`);
      channels[channelName] = scServer.exchange.subscribe(channelName);
      channels[channelName].watch((data) => {
        log.info(`socket: ${channelName}`, data);
        return socket.emit(channelName, data);
      });
    });
    socket.on("publish", (packet) => {
      scServer.exchange.publish(packet.event, packet.data);
    });
  });
}
