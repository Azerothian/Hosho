import Promise from "bluebird";
import socketClusterClient from "socketcluster-client";
import logger from "utils/logger";
import redis from "utils/redis";
import {createMD5Hash, chunkString} from "utils/text";
import config from "config";
import guid from "guid";

//This file proxy messages received via router:{id}
//and sends out messages to outher routers

const log = logger("hosho:router:modules:proxy:");
const rstore = redis(config.redis);
function createMessageKey(source, target, id, prefix = "send") {
  return {
    key: `message:${prefix}:${source}:${target}:${id}`,
    data: `message:${prefix}:${source}:${target}:${id}:data`,
  };
}


log.info("socketcluster client connecting", {hostname: "localhost", port: config.port});
const socket = Promise.promisifyAll(socketClusterClient.connect({hostname: "localhost", port: config.port}));
socket.on("connect", () => {
  log.info("socketcluster client connected");
  socket.subscribe(`router:${config.id}`);
  socket.subscribe("send");
  const revents = redis(config.redis);
  revents.on("message", (channelName, message) => {
    if (channelName === "hosho:messages") {
      log.info("hosho:messages", message);
      const e = JSON.parse(message);
      socket.emit("publish", e);
    }
  });
  revents.subscribe("hosho:messages");
});

socket.on(`router:${config.id}`, ({source, target, id, index, total, data}) => {
  const mk = createMessageKey(source, target, id, "receive");
  log.info("router message received", {
    source, target, messageDataKey: mk.data, data, total,
  });
  return rstore.multi()
    .hmset(mk.key, "source", source)
    .hmset(mk.key, "target", target)
    .hmset(mk.key, "dataKey", mk.data)
    .hmset(mk.data, `${index}`, data)
    .hmset(mk.key, "total", total)
    .execAsync().then((replies) => {
      return rstore.hlenAsync(mk.data);
    }).then((fieldCount) => {
      log.info(`field count - ${mk.key}:`, fieldCount);
      if (fieldCount === total) {
        return rstore.saddAsync("queue:receive", mk.key);
      }
      return undefined;
    });
});

socket.on("send", (e) => {
  log.info("send event received", e);
  const data = JSON.stringify(Object.assign({source: config.id}, e));
  const id = guid.create();
  const mk = createMessageKey(config.id, e.target, id, "send");
  const hash = createMD5Hash(data);
  const dataArr = chunkString(data, config.messagePartLength);
  const dataObj = dataArr.reduce((obj, curr, index) => {
    obj[`${index}`] = curr;
    return obj;
  }, {});
  log.info("dataObj", dataObj);
  return rstore.multi()
    .hmset(mk.key, "id", id)
    .hmset(mk.key, "source", config.id)
    .hmset(mk.key, "target", e.target)
    .hmset(mk.key, "hash", hash)
    .hmset(mk.key, "dataKey", mk.data)
    .hmset(mk.data, dataObj)
    .hmset(mk.key, "total", dataArr.length)
    .execAsync().then(() => {
      return Object.keys(dataObj).forEach((key) => {
        return socket.emit("publish", {
          event: `router:${e.target}`,
          data: {
            id: id,
            source: config.id,
            target: e.target,
            index: key,
            data: dataObj[key],
            total: dataArr.length,
            hash: hash,
          },
        });
      });
    });
});
