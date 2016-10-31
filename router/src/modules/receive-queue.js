import logger from "utils/logger";
import redis from "utils/redis";
import {scheduleJob} from "node-schedule";
import {lock} from "utils/thread";
import config from "config";

//TODO: check age for messages
//TODO: validate message against checksum
//TODO: check if message has already been processed

const log = logger("hosho:router:processors:receive-queue:");
const rstore = redis(config.redis);
scheduleJob("* * * * * *", lock(() => {
  // log.info("starting job");
  return rstore.smembersAsync("queue:receive").then((members = []) => {
    if (members.length > 0) {
      const messageKey = members[0];
      log.info(`message ready for processing - ${messageKey}`);
      return rstore.hgetallAsync(messageKey).then(({dataKey}) => {
        return rstore.hgetallAsync(dataKey).then((data) => {
          return Object.keys(data).sort((a, b) => {
            const nA = parseInt(a);
            const nB = parseInt(b);
            if (nA < nB) {
              return -1;
            }
            if (nA > nB) {
              return 1;
            }
            return 0;
          }).reduce((obj, key) => {
            return obj + data[key];
          }, "");
        }).then((result) => {
          log.info("sending message to redis", result);
          return Promise.all([
            rstore.publishAsync("hosho:messages", result),
            rstore.delAsync(messageKey, dataKey),
            rstore.sremAsync("queue:receive", messageKey),
          ]);
        });
      });
    }
    return undefined;
  });
}));

