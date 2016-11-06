var process = require("process");
module.exports = {
  master: {
    // protocol: "ws",
    hostname: process.env.MASTER_HOST,
    port: process.env.MASTER_PORT,
  },
  port: process.env.SOCKETCLUSTER_PORT,
  // server: {
  //   port: 1803,
  // },
  "id": process.env.ROUTER_ID,
  messagePartLength: 512, // each message part bytes
  enableBroker: (process.env.MASTER_HOST && process.env.MASTER_PORT),
};

module.exports.default = module.exports;
