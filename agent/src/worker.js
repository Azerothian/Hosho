import logger from "utils/logger";
import config from "config"
const log = logger(`hosho:agent:worker:${process.pid}:`);
export function run(host) {
  log.info("loading worker..");
  startAgentServer(host);
}


function startAgentServer(worker) {
  const {scServer} = worker;
  scServer.on("connection", (socket) => {
    const channels = [];
    let agentId = null;
    function agentConnected(agId) {
      log.info(`connected agent:${agId}`);
      const agentMessages = scServer.exchange.subscribe(`agent:${agId}`);
      agentMessages.watch((data) => {
        log.info(`agent:${agId}`, data);
        return socket.emit("agent:message", data);
      });
      log.info(`connected agent:${agId} - complete`);
      return channels.push(agentMessages);
    }
    socket.on("agent:register", ({id, connected = []}, callback) => {
      agentId = id;
      log.info("agent:register", id);
      [id].concat(connected).forEach(agentConnected);
      return callback(null, true);
    });
    socket.on("remote-agent:connected", ({id}, callback) => {
      log.info("remote-agent:connected", agentId, id);
      agentConnected(id);
      return callback(null, true);
    });

    socket.on("agent:message", (message) => {
      const {target} = message;
      if (target === config.id) {
        log.info(`agent:message:emit destination found agent:${target}`, message);
        return scServer.exchange.publish("")
      }
      log.info(`agent:message:emit agent:${target}`, message);
      return scServer.exchange.publish(`agent:${target}`, message);
    });
  });
}
