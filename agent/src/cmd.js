import config from "config";

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export default function cmd(socket) {
  rl.question(`[${config.id}] Target Id>`, (targetId) => {
    rl.question(`[${config.id}] Message>`, (message) => {
      socket.emit("publish", {
        event: `agent:${targetId}`,
        data: {source: config.id, target: targetId, message: message}
      });
      return cmd(socket);
    });
  });
}
