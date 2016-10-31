import redis from "redis";
import Promise from "bluebird";

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

export default function createClient(config) {
  return redis.createClient(config);
}
