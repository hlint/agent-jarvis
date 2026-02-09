import { cloneDeep } from "es-toolkit";
import * as jsonpatch from "fast-json-patch";
import lz from "lz-string";

/* 是否启用压缩
启用后，大消息的体积明显减小，利于网络传输，但是不利于debug，且略微影响客户端性能
*/
const ENABLE_COMPRESS = true;

export function messageEncode(message: any) {
  if (ENABLE_COMPRESS) {
    return lz.compressToUTF16(JSON.stringify(message));
  } else {
    return `text:${JSON.stringify(message)}`;
  }
}

export function messageDecode(message: any): unknown {
  if (ENABLE_COMPRESS) {
    return JSON.parse(lz.decompressFromUTF16(message));
  } else {
    return JSON.parse(message.slice(5));
  }
}

export function applyDiff<T extends object | any[]>(
  prevState: T,
  diff: jsonpatch.Operation[],
) {
  const newState = jsonpatch.applyPatch(cloneDeep(prevState), diff).newDocument;
  return newState;
}

export function createDiff<T extends object | any[]>(
  prevState: T,
  newState: T,
) {
  const diff = jsonpatch.compare(prevState, newState);
  return diff;
}
