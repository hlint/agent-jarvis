import { cloneDeep } from "es-toolkit";
import * as jsonpatch from "fast-json-patch";
import lz from "lz-string";

/* Whether to enable compression.
   When enabled, large messages are significantly smaller for network transfer,
   but harder to debug and slightly impacts client performance.
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
