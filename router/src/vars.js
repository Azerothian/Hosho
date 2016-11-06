
import config from "config";
export default {
  socket: {
    currentChannel: `router:channel:${config.id}`,
    channel: "router:channel:",
    messageReceived: "router:message",
    sendMessage: "router:send",
  },
  redis: {
    receiveQueue: `${config.id}:queue:receive`,
    messagePrefix: `${config.id}:router:message`,
  },
};
