import logger from "utils/logger";
import path from "path";
import {runScript} from "utils/thread";
import config from "config";

//TODO: have modules auto restart etc

export function run(server) {
  const log = logger(`hosho:router[${config.id}]:master:`);
  server.on("ready", (app) => {
    runScript(path.join(__dirname, "modules/proxy.js"));
    runScript(path.join(__dirname, "modules/receive-queue.js"));
  });
  server.on("notice", (e) => log.info("notice", e));
  server.on("fail", (e) => log.info("fail", e));
  process.on("SIGTERM", () => { //TODO: allow for cleanup - would not die cleanly on mac os x - node v7
    log.info("SIGTERM - time to die");
    //process.exit(); //eslint-disable-line
  });
}



/*
{
  event: "router:${routerId}:message",
  data: {
    source: "{id}",
    target: "{id}",
    id: "{gui}",
    index: 0,
    total: 10,
    data: "data"
  }

}

*/