import scClusterBrokerClient from "sc-cluster-broker-client";
// import config 
export function run(broker) {
  console.log("   >> Broker PID:", process.pid);
  // broker.on("emit", (channel, data) => {
  //   if(channel === "agent:message")
  // })
  if (broker.options.clusterStateServerHost) {
    scClusterBrokerClient.attach(broker, {
      stateServerHost: broker.options.clusterStateServerHost,
      stateServerPort: broker.options.clusterStateServerPort,
      authKey: broker.options.clusterAuthKey,
      stateServerConnectTimeout: broker.options.clusterStateServerConnectTimeout,
      stateServerAckTimeout: broker.options.clusterStateServerAckTimeout,
      stateServerReconnectRandomness: broker.options.clusterStateServerReconnectRandomness,
    });
  }

}