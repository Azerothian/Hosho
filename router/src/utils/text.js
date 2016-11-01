
import crypto from "crypto";

export function createMD5Hash(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}
export function chunkString(str, length) {
  return str.match(new RegExp(`.{1,${length}}`, "g"));
}
