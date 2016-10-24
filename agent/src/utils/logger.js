import debug from "debug";

export default function(prefix = "") {
  return {
    err: debug(`${prefix}err`),
    info: debug(`${prefix}info`),
    warn: debug(`${prefix}warn`),
    debug: debug(`${prefix}debug`),
  };
}
