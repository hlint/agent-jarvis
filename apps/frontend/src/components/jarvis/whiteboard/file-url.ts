export function buildJarvisFileUrl(filePath: string, revision = 0) {
  const url = `/jarvis/file?path=${encodeURIComponent(filePath)}`;
  return revision > 0 ? `${url}&_=${revision}` : url;
}
