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


export function runScript(scriptPath) {
  log.info(`launching ${scriptPath}`);
  return childProcess.fork(scriptPath);
}
