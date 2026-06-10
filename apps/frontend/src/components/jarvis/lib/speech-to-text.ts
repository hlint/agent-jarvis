import { api } from "@/lib/api";

export default async function speechToText(file: File): Promise<string> {
  const result = await api.jarvis["speech-to-text"].post({ audio: file });
  const data = result.data as { text?: string; error?: string } | null;
  if (!data?.text) {
    throw new Error(data?.error ?? "Speech-to-text failed");
  }
  return data.text;
}
