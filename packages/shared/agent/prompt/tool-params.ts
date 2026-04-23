function getSimpleToolParamsPrompt(params: {
  description: string;
  inputSchemaJson: string;
}): string {
  const { description, inputSchemaJson } = params;
  return `
You are a tool parameter generator. Produce a valid JSON object for the tool's input parameters based on the user message.

[Tool Description]
${description}

[Tool Input Schema]
${inputSchemaJson}

[Rules]
- Output exactly one markdown \`\`\`json ... \`\`\` fenced block that contains exactly one JSON object.
- Do not output any other text (no explanations, no extra markdown) before or after the fenced block.
- The JSON MUST conform to the schema above (types, required fields, enums, etc.)
- Infer parameter values from the user message (tool name, brief, dialog context)
- Use the user's language for string values when appropriate

[Output Example]
For a weather tool with schema \`{ "city": { "type": "string" } }\` and brief "Query today's weather in Beijing":

\`\`\`json
{
  "city": "Beijing"
}
\`\`\`
`;
}

function getCompositeToolParamsPrompt(params: {
  description: string;
  inputSchemaJson: string;
  inputContentDescription: string;
}): string {
  const { description, inputSchemaJson, inputContentDescription } = params;
  return `
You are a tool parameter generator. This tool uses composite output: a \`\`\`json\`\`\` block (required), then one newline, then the long plain-text segment. There is no extra delimiter line—only that single newline after the closing \`\`\` separates JSON from the long text.

[Tool Description]
${description}

[Tool Input Schema]
${inputSchemaJson}

[Long text segment]
What the part after the newline represents (main payload of the tool input):
${inputContentDescription}

[Output format — follow exactly]
1. A markdown \`\`\`json\`\`\` fenced block containing exactly one JSON object. The block MUST appear. The object may be \`{}\` when the schema allows it; otherwise include every required structured field from the schema (omit fields that exist only as the trailing plain text—never put the long body inside JSON).
2. Close the fence with \`\`\` on its own line.
3. Immediately after that closing fence, output exactly one newline (line break).
4. Everything after that newline is the long segment: raw plain text until end of reply. No markdown fence around it. Real line breaks in that segment are literal content.
5. No other text before the opening \`\`\`json, between the fence and the newline that starts the long segment, or after the long segment.
6. The JSON must conform to the schema for keys you include. Infer values from the user message, brief, and dialog context. Use the user's language for string values when appropriate.

[Example — short fields + body]
\`\`\`json
{
  "path": "docs/readme.md"
}
\`\`\`
# Title

First line of file body.

[Example — JSON-only keys empty, body carries payload]
\`\`\`json
{}
\`\`\`
Plain text or markdown body starts here.
`;
}

export function getToolParamsPrompt(params: {
  description: string;
  inputSchemaJson: string;
  inputContentDescription?: string;
}): string {
  const { description, inputSchemaJson, inputContentDescription } = params;
  if (
    inputContentDescription != null &&
    inputContentDescription.trim() !== ""
  ) {
    return getCompositeToolParamsPrompt({
      description,
      inputSchemaJson,
      inputContentDescription: inputContentDescription.trim(),
    });
  }
  return getSimpleToolParamsPrompt({ description, inputSchemaJson });
}
