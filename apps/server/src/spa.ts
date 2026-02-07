import { extname, join } from "node:path";
import { Elysia } from "elysia";

export const spa = (options: { dir: string }) => {
  const { dir } = options;
  const baseUrl = "/";
  const index = "index.html";
  const plugin = new Elysia({ name: "spa", seed: options });

  plugin.get(join(baseUrl, "*"), async ({ set, path }) => {
    // Normalize request path and strip baseUrl prefix (baseUrl is fixed as "/")
    let requestPath = path.startsWith(baseUrl)
      ? path.slice(baseUrl.length)
      : path;
    if (!requestPath || requestPath === "/") requestPath = index;

    const hasExt = !!extname(requestPath);

    if (hasExt) {
      // Static asset with extension; return 404 if file does not exist
      const filePath = join(dir, requestPath);
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        set.status = 404;
        return "Not Found";
      }

      set.headers["content-type"] = file.type;
      return file;
    }

    // For all other cases, always return index.html (SPA fallback)
    const indexFile = Bun.file(join(dir, index));
    set.headers["content-type"] = indexFile.type;
    return indexFile;
  });

  return plugin;
};
