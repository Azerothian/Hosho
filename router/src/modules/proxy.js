import Promise from "bluebird";
import socketClusterClient from "socketcluster-client";
import logger from "utils/logger";
import redis from "utils/redis";
import config from "config";

//This file proxy messages received via router:{id}
//and will send out messages

//TODO: publish messages received from redius queue

//TODO: subscribe to a send event and create messages to be sent


const log = logger("hosho:router:modules:proxy:");
const rstore = redis(config.redis);
log.info("socketcluster client connecting", {hostname: "localhost", port: config.port});
const socket = Promise.promisifyAll(socketClusterClient.connect({hostname: "localhost", port: config.port}));
socket.on("connect", () => {
  log.info("socketcluster client connected");
  socket.subscribe(`router:${config.id}`);
  const revents = redis(config.redis);
  revents.on("message", (channelName, message) => {
    if (channelName === "hosho:messages") {
      log.info("hosho:messages", message);
    }
  });
  revents.subscribe("hosho:messages");
});

socket.on(`router:${config.id}`, ({source, target, id, index, total, data}) => {
  const messageKey = `message:${source}:${target}:${id}`;
  const messageDataKey = `${messageKey}:data`;
  log.info("router message received", {
    source, target, messageDataKey, data, total,
  });
  return rstore.multi()
    .hmset(messageKey, "source", source)
    .hmset(messageKey, "target", target)
    .hmset(messageKey, "dataKey", messageDataKey)
    .hmset(messageDataKey, `${index}`, data)
    .hmset(messageKey, "total", total)
    .execAsync().then((replies) => {
      return rstore.hlenAsync(messageDataKey);
    }).then((fieldCount) => {
      log.info(`field count - ${messageKey}:`, fieldCount);
      if (fieldCount === total) {
        return rstore.saddAsync("queue:receive", messageKey);
      }
      return undefined;
    });
});
