import { nanoid } from "nanoid";

export function shortId(): string {
  return nanoid(6);
}

/**
 * Replace `{key}` placeholders in a template string with values from a map.
 * Unmatched placeholders are left unchanged.
 * @param template - String containing `{key}` placeholders.
 * @param params - Map of placeholder names to replacement values.
 * @example
 * interpolateTemplate("Hello, ${name}!", { name: "John" }) // "Hello, John!"
 * @returns The interpolated string.
 */
export function interpolateTemplate(
  template: string,
  params: Record<string, string>,
) {
  return template.replace(/\{\{([^{}]+)\}\}/g, (_, p1) => params[p1] ?? _);
}
