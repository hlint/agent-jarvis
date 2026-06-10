export function stringifyFrontmatterMd(
  attributes: Record<string, string | number | boolean>,
  body: string,
): string {
  const lines = Object.entries(attributes).map(
    ([key, value]) => `${key}: ${String(value).replace(/\n/g, " ").trim()}`,
  );
  const trimmedBody = body.replace(/^\n+/, "");
  return `---\n${lines.join("\n")}\n---\n\n${trimmedBody}`;
}
