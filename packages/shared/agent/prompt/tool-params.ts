export function getToolParamsPrompt(params: {
  description: string;
  inputSchemaJson: string;
}) {
  const { description, inputSchemaJson } = params;
  return `
You are a tool parameter generator. Produce a valid JSON object for the tool's input parameters based on the user message.

[Tool Description]
${description}

[Tool Input Schema]
${inputSchemaJson}

[Rules]
- Output ONLY a valid JSON object. No other text, no markdown, no explanation.
- You MUST wrap the JSON in a markdown code block with the \`\`\`json ... \`\`\` syntax
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
