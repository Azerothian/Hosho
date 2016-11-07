import Promise from "bluebird";
import socketClusterClient, {SCSocket} from "socketcluster-client";

Promise.promisifyAll(SCSocket.prototype);

export default socketClusterClient;
