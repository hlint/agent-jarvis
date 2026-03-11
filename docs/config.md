# Configuration

Agent Jarvis uses `config.ts` for configuration. Copy `docs/assets/config.example.ts` to `config.ts` and fill in your API keys to get started.

- **Local development**: Config file path is `config.ts` at project root
- **Docker**: Mount via `./volumes/config.ts:/agent-jarvis/config.ts`
- **Hot reload**: Changes to `config.ts` are picked up automatically; no restart needed

---

## Config structure

```ts
const config = {
  providers: [
    /* AI service providers */
  ],
  tavilyApiKey: "", // optional
  pexelsApiKey: "", // optional
  ntfyTopic: "", // optional
};
```

---

## AI providers

Each provider corresponds to one AI service and can handle one or more duties.

| Field             | Type     | Required | Description                                        |
| ----------------- | -------- | -------- | -------------------------------------------------- |
| `model`           | string   | ✓        | Model ID in `provider:model-id` format             |
| `apiKey`          | string   | ✓        | API key for this provider                          |
| `baseURL`         | string   |          | Custom API endpoint for proxy or self-hosted usage |
| `providerOptions` | object   |          | Provider-specific options passed to the AI SDK     |
| `duties`          | string[] | ✓        | List of duties this provider handles               |

### Model ID format

Format: `provider:model-name`

Common examples:

| Provider          | Examples                                           |
| ----------------- | -------------------------------------------------- |
| OpenAI            | `openai:gpt-4o`, `openai:gpt-4o-mini`              |
| Google            | `google:gemini-2.5-flash`, `google:gemini-2.5-pro` |
| Anthropic         | `anthropic:claude-3-5-sonnet`                      |
| DeepSeek          | `deepseek:deepseek-chat`                           |
| xAI               | `xai:grok-beta`                                    |
| Azure             | `azure:gpt-4o`                                     |
| Vercel AI         | `vercel:...`                                       |
| Together AI       | `together-ai:...`                                  |
| Hugging Face      | `hugging-face:...`                                 |
| Alibaba           | `alibaba:...`                                      |
| ByteDance         | `byte-dance:...`                                   |
| Fal               | `fal:...`                                          |
| Black Forest Labs | `black-forest-labs:...`                            |
| Google Vertex     | `vertex:...`                                       |

### Duties

A provider can handle multiple duties. The system looks up a provider by duty type.

| Duty                | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `CHAT`              | **Required.** Main conversation, reasoning, and text output |
| `VOICE_RECOGNITION` | Transcribe audio to text                                    |
| `IMAGE_RECOGNITION` | Understand image content                                    |
| `VIDEO_RECOGNITION` | Understand video content                                    |
| `OTHER_RECOGNITION` | Understand PDFs, documents, and other file types            |
| `VOICE_GENERATION`  | Generate speech                                             |
| `IMAGE_GENERATION`  | Generate images                                             |
| `VIDEO_GENERATION`  | Generate video                                              |

**Minimum config**: At least one provider with the `CHAT` duty is required.

### Example: Single provider for chat

```ts
providers: [
  {
    model: "openai:gpt-4o",
    apiKey: "sk-...",
    duties: ["CHAT"],
  },
],
```

### Example: Multiple providers by duty

```ts
providers: [
  {
    model: "openai:gpt-4o",
    apiKey: "sk-...",
    duties: ["CHAT", "IMAGE_RECOGNITION", "OTHER_RECOGNITION"],
  },
  {
    model: "openai:tts-1",
    apiKey: "sk-...",
    duties: ["VOICE_GENERATION"],
  },
  {
    model: "openai:dall-e-3",
    apiKey: "sk-...",
    duties: ["IMAGE_GENERATION"],
  },
],
```

### Example: Custom API endpoint (baseURL)

```ts
{
  model: "openai:gpt-4o",
  apiKey: "sk-...",
  baseURL: "https://your-proxy.com/v1",
  duties: ["CHAT"],
},
```

---

## Optional services

### tavilyApiKey

[Tavily](https://tavily.com/) web search API key. When set, enables the built-in web search tool.

### pexelsApiKey

[Pexels](https://www.pexels.com/api/) stock image API key. When set, enables the image search tool (best for nature, cities, lifestyle, and similar generic queries).

### ntfyTopic

[ntfy.sh](https://ntfy.sh/) topic name. When set, enables the push notification tool to send messages to the given topic (subscribe via an ntfy client).

---

## Full example

```ts
const config = {
  providers: [
    {
      model: "google:gemini-2.5-flash",
      apiKey: "AIza...",
      duties: [
        "CHAT",
        "IMAGE_RECOGNITION",
        "VIDEO_RECOGNITION",
        "OTHER_RECOGNITION",
      ],
    },
    {
      model: "openai:dall-e-3",
      apiKey: "sk-...",
      duties: ["IMAGE_GENERATION"],
    },
  ],
  tavilyApiKey: "tvly-...",
  pexelsApiKey: "...",
  ntfyTopic: "my-jarvis-alerts",
};

export default config;
```
