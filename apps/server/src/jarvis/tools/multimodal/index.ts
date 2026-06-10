import { tool } from "ai";
import type Jarvis from "../..";
import { multimodalSubagentInputSchema } from "../../multimodal-subagent";

export default function createMultimodalTool(jarvis: Jarvis) {
  return tool({
    description:
      "Delegate file understanding to a multimodal sub-AI. Use when you need to process files the main AI cannot read directly: transcribe audio, analyze images, summarize PDFs or documents, describe video content. Provide clear instructions for what to extract or produce.",
    inputSchema: multimodalSubagentInputSchema,
    inputExamples: [
      {
        input: {
          fileType: "audio",
          files: ["sessions/abc/attachments/voice.webm"],
          instruction: "Transcribe this audio verbatim.",
        },
      },
      {
        input: {
          fileType: "image",
          files: ["tmp/screenshot.png"],
          instruction: "Describe what you see in this image.",
        },
      },
    ],
    execute: async (input) => {
      const { text } = await jarvis.multimodalSubagent.run(input);
      return text;
    },
  });
}
