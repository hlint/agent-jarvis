/** AI provider roles. A provider can have multiple duties. */
type ProviderDuties =
  | "CHAT" // Main conversation, thinking, and text output
  | "VOICE_RECOGNITION" // Transcribe audio
  | "IMAGE_RECOGNITION" // Understand images
  | "VIDEO_RECOGNITION" // Understand video
  | "OTHER_RECOGNITION" // PDF, documents, and other file types
  | "VOICE_GENERATION" // Generate speech
  | "IMAGE_GENERATION" // Generate images
  | "VIDEO_GENERATION"; // Generate video

interface Config {
  /** API key for Tavily web search (optional) */
  tavilyApiKey?: string;
  /** API key for Pexels image search (optional) */
  pexelsApiKey?: string;
  /** ntfy.sh topic for push notifications (optional) */
  ntfyTopic?: string;
  /** AI providers. Each provider handles one or more duties. */
  providers: Array<{
    /** Model ID, e.g. "openai:gpt-4o", "google:gemini-2.5-flash" */
    model: string;
    /** API key for the provider */
    apiKey: string;
    /** Base URL for API (optional, for custom endpoints) */
    baseURL?: string;
    /** Provider-specific options */
    providerOptions?: any;
    /** Duties this provider handles */
    duties: ProviderDuties[];
  }>;
}

const config: Config = {
  providers: [
    {
      model: "",
      apiKey: "",
      duties: ["CHAT"],
    },
  ],
  tavilyApiKey: "",
  pexelsApiKey: "",
  ntfyTopic: "",
};

export default config;
