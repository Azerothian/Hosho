import minimist from "minimist";
import fs from "fs";
import {SocketCluster} from "socketcluster";
import Promise from "bluebird";

const defaultVars = {
  workers: 1,
  brokers: 1,
  port: 8000,
  // If your system doesn't support 'uws', you can switch to 'ws' (which is slower but works on older systems).
  wsEngine: "uws",
  appName: null,
  initController: null,
  socketChannelLimit: 1000,
  clusterStateServerHost: null,
  clusterStateServerPort: null,
  clusterAuthKey: null,
  clusterStateServerConnectTimeout: null,
  clusterStateServerAckTimeout: null,
  clusterStateServerReconnectRandomness: null,
  crashWorkerOnError: true,
  bootCheckInterval: 200,
};

export function createConfig(baseConfig, options = {}) {
  const {processArgs = false, processEnv = true, defaults = defaultVars} = options;
  let argOptions, envOptions, jsonOptions;
  if (processArgs) {
    const argv = minimist(process.argv.slice(2));
    argOptions = {
      workers: Number(argv.w),
      brokers: Number(argv.b),
      port: Number(argv.p),
      appName: argv.n,
      clusterStateServerHost: argv.cssh,
      crashWorkerOnError: argv["auto-reboot"] !== false,
      initController: argv.ic,
      workerControllerPath: argv.wc,
      brokerControllerPath: argv.bc,
      masterControllerPath: argv.mc,
    };
  }
  if (processEnv) {
    envOptions = {
      workers: Number(process.env.SOCKETCLUSTER_WORKERS),
      brokers: Number(process.env.SOCKETCLUSTER_BROKERS),
      port: Number(process.env.SOCKETCLUSTER_PORT),
      wsEngine: process.env.SOCKETCLUSTER_WS_ENGINE,
      appName: process.env.SOCKETCLUSTER_APP_NAME,
      workerController: process.env.SOCKETCLUSTER_WORKER_CONTROLLER,
      brokerController: process.env.SOCKETCLUSTER_BROKER_CONTROLLER,
      masterController: process.env.SOCKETCLUSTER_MASTER_CONTROLLER,
      initController: process.env.SOCKETCLUSTER_INIT_CONTROLLER,
      socketChannelLimit: Number(process.env.SOCKETCLUSTER_SOCKET_CHANNEL_LIMIT),
      clusterStateServerHost: process.env.SCC_STATE_SERVER_HOST,
      clusterStateServerPort: process.env.SCC_STATE_SERVER_PORT,
      clusterAuthKey: process.env.SCC_AUTH_KEY,
      clusterStateServerConnectTimeout: Number(process.env.SCC_STATE_SERVER_CONNECT_TIMEOUT),
      clusterStateServerAckTimeout: Number(process.env.SCC_STATE_SERVER_ACK_TIMEOUT),
      clusterStateServerReconnectRandomness: Number(process.env.SCC_STATE_SERVER_RECONNECT_RANDOMNESS),
      bootCheckInterval: Number(process.env.SOCKETCLUSTER_BOOT_CHECK_INTERVAL),
    };
    Object.keys(envOptions).forEach((key) => {
      if (isNaN(envOptions[key]) || !(envOptions[key])) {
        delete envOptions[key];
      }
    });
  }
  if (process.env.SOCKETCLUSTER_OPTIONS) {
    jsonOptions = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS);
  }
  const config = Object.assign({}, defaults, envOptions, argOptions, jsonOptions, baseConfig);
  console.log("config", config);
  return config;
}
//TODO: dont like this function should never need to make a promise.
export function isFileReady(filePath, {bootCheckInterval}) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      const checkIsReady = () => {
        return fs.exists(filePath, (exists) => {
          if (exists) {
            return resolve();
          } else {
            return setTimeout(checkIsReady, bootCheckInterval);
          }
        });
      };
      return checkIsReady();
    }
    return resolve(); // resolves if filePath is not provided
  });
}

export function checkIsSystemReady(config) {
  const {masterController, workerController, brokerController, initController} = config;
  return Promise.all([
    isFileReady(masterController, config),
    isFileReady(workerController, config),
    isFileReady(brokerController, config),
    isFileReady(initController, config),
  ]);
}

export function startSocketCluster(baseConfig, configOptions) {
  const config = createConfig(baseConfig, configOptions);
  let start = () => {
    const socketCluster = new SocketCluster(config);
    if (config.masterController) {
      require(config.masterController).run(socketCluster);
    }
    return Promise.resolve(socketCluster);
  };
  if (config.workerController) {
    return checkIsSystemReady(config).then(start);
  }
  return start();
}
