import logger from "utils/logger";
import path from "path";
import {runScript} from "utils/thread";

//TODO: have modules auto restart etc

export function run(server) {
  const log = logger("hosho:router:master:");
  server.on("ready", (app) => {
    runScript(path.join(__dirname, "modules/proxy.js"));
    runScript(path.join(__dirname, "modules/receive-queue.js"));
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