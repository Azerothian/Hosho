import expect from "expect";
// import childProcess from "child_process";
import Promise from "bluebird";
import path from "path";
// import socketClusterClient from "socketcluster-client";

import logger from "utils/logger";
import {runScript} from "utils/thread";
// import vars from "../vars";

import Client from "../client";

const log = logger("hosho:router:tests:index.test:");

const appPath = path.resolve(__dirname, "../index.js");

const routers = {
  "master": {
    id: "0",
    port: 1800,
  },
  "1": {
    id: "1",
    port: 1801,
    masterIp: "127.0.0.1",
    masterPort: 1800,
  },
  "2": {
    id: "2",
    port: 1802,
    masterIp: "127.0.0.1",
    masterPort: 1800,
  },
  "1-3": {
    id: "1-3",
    port: 1803,
    masterIp: "127.0.0.1",
    masterPort: 1801,
  },
  "2-4": {
    id: "2-4",
    port: 1804,
    masterIp: "127.0.0.1",
    masterPort: 1802,
  },
};

const processes = [];
let sockets = {};

function createApp(env) {
  return runScript(appPath, [], Object.assign({
    DEBUG: process.env.DEBUG,
  }, env));
  // return childProcess.fork(appPath, [], {
  //   env: Object.assign({
  //     DEBUG: "*",
  //   }, env),
  // });
}

function createRouter({id, port, masterIp, masterPort}) {
  let config = {
    SOCKETCLUSTER_PORT: port,
    ROUTER_ID: id,
  };
  if (masterIp) {
    config = Object.assign(config, {
      MASTER_HOST: masterIp,
      MASTER_PORT: masterPort,
    });
  }
  return createApp(config);
}

function createSocket(name, {port}) {
  return new Promise((resolve, reject) => {
    sockets[name] = new Client({hostname: "127.0.0.1", port});
    sockets[name].on("connect", () => {
      return resolve();
    });
  });
}


// function sendMessage(socket, targetId, event, message) {
//   return socket.emit("publish", {
//     event: vars.socket.sendMessage,
//     data: {
//       target: targetId,
//       event: event,
//       data: message,
//     },
//   });
// }

describe("test", () => {
  before((done) => {
    processes.push(createRouter(routers.master));
    processes.push(createRouter(routers["1"]));
    processes.push(createRouter(routers["1-3"]));
    // processes.push(createRouter(routers["2"]));
    // processes.push(createRouter(routers["2-4"]));
    return setTimeout(() => {
      return Promise.all([
        createSocket("master", routers.master),
        createSocket("1", routers["1"]),
        createSocket("1-3", routers["1-3"]),
        // createSocket("2", routers["2"]),
        // createSocket("2-4", routers["2-4"]),
      ]).then(() => done());
    }, 10000);
  });
  after((done) => {
    log.info("disconnecting sockets");
    Promise.all(Object.keys(sockets).map((key) => {
      return sockets[key].disconnect();
    })).then(() => {
      log.info("killing routers");
      processes.forEach((proc) => {
        return proc.kill();
      });
      done();
    });
  });


  it("basic message test master to router:1", () => {
    log.info("starting basic messaging test");
    return new Promise((resolve, reject) => {
      function onMessageReceived(data) {
        log.info("messageReceived", data);
        expect(data).toEqual("HI");
        sockets["1"].off("sayhello", onMessageReceived);
        return resolve();
      }
      sockets["1"].on("sayhello", onMessageReceived);
      log.info("sending message hello");
      sockets.master.emit("1", "sayhello", "HI");
    });
  });

  it("basic message test master to router:1-3", () => {
    log.info("starting basic messaging test");
    return new Promise((resolve, reject) => {
      function onMessageReceived(data) {
        log.info("messageReceived", data);
        expect(data).toEqual("HI");
        sockets["1-3"].off("sayhello", onMessageReceived);
        return resolve();
      }
      sockets["1-3"].on("sayhello", onMessageReceived);
      log.info("sending message hello");
      sockets.master.emit("1-3", "sayhello", "HI");
    });
  });
});
