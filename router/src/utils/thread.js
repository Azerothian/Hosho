import logger from "utils/logger";

import childProcess from "child_process";

const log = logger("hosho:router:utils:thread:");
export function lock(func) {
  let lockObj = false;
  return function() {
    if (!lockObj) {
      lockObj = true;
      return func.apply(undefined, arguments).then(() => {
        lockObj = false;
      }, () => {
        lockObj = false;
      });
    }
    return undefined;
  };
}


export function runScript(scriptPath, args = [], env) {
  log.info(`launching ${scriptPath}`);
  const proc = childProcess.fork(scriptPath, args, {env});
  process.on("SIGTERM", () => {
    log.info("SIGTERM - attempting to kill child");
    return proc.kill("SIGTERM");
  });
  process.on("exit", () => {
    log.info("exit - attempting to kill child");
    return proc.kill("SIGTERM");
  });
  return proc;
}
