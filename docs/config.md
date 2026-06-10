# Configuration

Agent Jarvis uses `config.json` for configuration. Copy `config.example.json` to `config.json` and fill in your API keys to get started.

- **Local development**: Config file path is `config.json` at project root
- **Docker**: Mount via `./volumes/config.json:/agent-jarvis/config.json`
- **Hot reload**: Changes to `config.json` are picked up automatically; no restart needed

---

## Config structure

```json
{
  "providers": [
    {
      "model": "openai:gpt-4o",
      "apiKey": "sk-...",
      "duties": ["CHAT"]
    }
  ],
  "providerOptions": {
    "openai": {
      "reasoningEffort": "low",
      "textVerbosity": "low"
    }
  },
  "tavilyApiKey": ""
}
```

---

## AI providers

Each provider corresponds to one AI service and can handle one or more duties.

| Field     | Type     | Required | Description                                        |
| --------- | -------- | -------- | -------------------------------------------------- |
| `model`   | string   | ✓        | Model ID in `provider:model-id` format             |
| `apiKey`  | string   | ✓        | API key for this provider                          |
| `baseURL` | string   |          | Custom API endpoint for proxy or self-hosted usage |
| `duties`  | string[] | ✓        | List of duties this provider handles               |

### Model ID format

Format: `provider:model-name`

Common examples:

| Provider            | Examples                                           |
| ------------------- | -------------------------------------------------- |
| OpenAI              | `openai:gpt-4o`, `openai:gpt-4o-mini`              |
| Google              | `google:gemini-2.5-flash`, `google:gemini-2.5-pro` |
| Anthropic           | `anthropic:claude-3-5-sonnet`                      |
| DeepSeek            | `deepseek:deepseek-chat`                           |
| xAI                 | `xai:grok-beta`                                    |
| Azure               | `azure:gpt-4o`                                     |
| Vercel AI           | `vercel:...`                                       |
| Together AI         | `together-ai:...`                                  |
| Hugging Face        | `hugging-face:...`                                 |
| Alibaba             | `alibaba:...`                                      |
| ByteDance           | `byte-dance:...`                                   |
| Fal                 | `fal:...`                                          |
| Black Forest Labs   | `black-forest-labs:...`                            |
| Google Vertex       | `vertex:...`                                       |
| Minimax (OpenAI)    | `minimax-openai:...`                               |
| Minimax (Anthropic) | `minimax-anthropic:...`                            |

### Duties

A provider can handle multiple duties. The system looks up a provider by duty type.

| Duty                | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `CHAT`              | **Required.** Main conversation, reasoning, and text output |
| `VOICE_RECOGNITION` | Transcribe audio to text                                    |
| `IMAGE_RECOGNITION` | Understand image content                                    |
| `VIDEO_RECOGNITION` | Understand video content                                    |
| `OTHER_RECOGNITION` | Understand PDFs, documents, and other file types            |
| `IMAGE_GENERATION`  | Generate images                                             |

**Minimum config**: At least one provider with the `CHAT` duty is required.

---

## Provider options

`providerOptions` is an optional **top-level** object that is forwarded to the underlying AI SDK call.

- **Shape**: keys are provider names (e.g. `openai`, `anthropic`), values are provider-specific option objects.
- **Behavior**: only the active provider's options are used for a given request.

Example:

```json
{
  "providers": [
    {
      "model": "openai:gpt-5.2",
      "apiKey": "sk-...",
      "duties": ["CHAT"]
    }
  ],
  "providerOptions": {
    "openai": {
      "reasoningEffort": "low",
      "reasoningSummary": "auto",
      "textVerbosity": "low"
    }
  }
}
```

For the full list of supported options per provider, see [AI SDK Provider Options](https://ai-sdk.dev/docs/foundations/provider-options).

### Example: Single provider for chat

```json
{
  "providers": [
    {
      "model": "openai:gpt-4o",
      "apiKey": "sk-...",
      "duties": ["CHAT"]
    }
  ]
}
```

### Example: Multiple providers by duty

```json
{
  "providers": [
    {
      "model": "openai:gpt-4o",
      "apiKey": "sk-...",
      "duties": ["CHAT", "IMAGE_RECOGNITION", "OTHER_RECOGNITION"]
    },
    {
      "model": "openai:dall-e-3",
      "apiKey": "sk-...",
      "duties": ["IMAGE_GENERATION"]
    }
  ]
}
```

### Example: Custom API endpoint (baseURL)

```json
{
  "providers": [
    {
      "model": "openai:gpt-4o",
      "apiKey": "sk-...",
      "baseURL": "https://your-proxy.com/v1",
      "duties": ["CHAT"]
    }
  ]
}
```

---

## Optional services

### tavilyApiKey

[Tavily](https://tavily.com/) web search API key. When set, enables:

- `web_search_tavily` — general, news, and finance search
- `web_extract` — extract readable content from URLs

Without a Tavily key, these tools fail at execution time. The agent can still use file and shell tools.

### Web search on Full Docker

The **Full** image (`JARVIS_WITH_COMPUTER=true`) also bundles **SearXNG** on port 4203 and exposes `web_search_searxng` for multi-engine technical search. SearXNG does not require a config key.

---

## Notifications

In-app alerts use the `create_notification` tool (sidebar + optional **Web Push** via browser subscription). There is no ntfy or third-party push config in `config.json`.

---

## Full example

```json
{
  "providers": [
    {
      "model": "google:gemini-2.5-flash",
      "apiKey": "AIza...",
      "duties": [
        "CHAT",
        "IMAGE_RECOGNITION",
        "VIDEO_RECOGNITION",
        "OTHER_RECOGNITION"
      ]
    },
    {
      "model": "openai:dall-e-3",
      "apiKey": "sk-...",
      "duties": ["IMAGE_GENERATION"]
    }
  ],
  "providerOptions": {
    "openai": {
      "reasoningEffort": "low"
    }
  },
  "tavilyApiKey": "tvly-..."
}
```
