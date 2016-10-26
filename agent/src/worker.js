import logger from "utils/logger";
import config from "config";
const log = logger(`hosho:agent:worker:${process.pid}:`);
export function run(host) {
  log.info("loading worker..");
  startAgentServer(host);
}


function startAgentServer(worker) {
  const {scServer} = worker;
  scServer.on("connection", (socket) => {
    log.info("agent connected");
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
