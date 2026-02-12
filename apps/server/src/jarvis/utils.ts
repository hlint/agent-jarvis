export function stringifyFrontmatterMd(
  attributes: Record<string, string>,
  body: string,
): string {
  const lines = Object.entries(attributes).map(
    ([k, v]) => `${k}: ${String(v).replace(/\n/g, " ").trim()}`,
  );
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}
