import config from "config";
import Promise from "bluebird";
import socketClusterClient from "socketcluster-client";
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket = Promise.promisifyAll(socketClusterClient.connect({hostname: "localhost", port: config.port}));
socket.on("connect", () => {
  cmd(socket);
});
function cmd(socket) {
  rl.question(`[${config.id}] Target RouterId>`, (targetId) => {
    rl.question(`[${config.id}] Message>`, (message) => {
      // const messageId = guid.create();
      socket.emit("publish", {
        event: "send",
        data: {
          target: targetId,
          event: "agent:123",
          data: message,
        },
      });


      // socket.emit("publish", {
      //   event: `router:${targetId}`,
      //   source: config.id,
      //   target: targetId,
      //   id: messageId,
      //   index: 1,
      //   total: 2,
      //   data: {
      //     event: "agent:123",
      //     data: message,
      //   }
      // });
      // socket.emit("publish", {
      //   event: `router:${targetId}`,
      //   data: {
      //     source: config.id,
      //     target: targetId,
      //     id: messageId,
      //     index: 1,
      //     total: 2,
      //     data: `${message}1`,
      //   },
      // });
      // socket.emit("publish", {
      //   event: `router:${targetId}`,
      //   data: {
      //     source: config.id,
      //     target: targetId,
      //     id: messageId,
      //     index: 0,
      //     total: 2,
      //     data: `${message}2`,
      //   },
      // });
      return cmd(socket);
    });
  });
}
