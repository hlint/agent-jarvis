import { createHighlighter, type Highlighter } from "shiki";

const HTML_HIGHLIGHT_THEME = "github-dark" as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [HTML_HIGHLIGHT_THEME],
      langs: ["html"],
    });
  }
  return highlighterPromise;
}

export async function highlightHtml(code: string): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang: "html",
    theme: HTML_HIGHLIGHT_THEME,
  });
}
