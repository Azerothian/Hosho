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
  "id": process.env.AGENT_ID,
  messagePartLength: 5, // each message part bytes
};

module.exports.default = module.exports;
