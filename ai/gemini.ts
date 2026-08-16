import { GoogleGenAI } from "@google/genai";

export const MODEL = "gemini-3.6-flash";

let client: GoogleGenAI | null = null;

/**
 * Built lazily and reused. Reading the key here rather than at import time
 * means a missing key throws a clear error instead of letting the SDK
 * silently fall back to Vertex AI / ADC.
 */
export function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Copy .env.example to .env.");
  }

  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export type MessageInput = {
  role: "USER" | "ASSISTANT";
  content: string;
};

/** Send one message to Gemini and return the reply text. */
export async function generateReply(history: MessageInput[]): Promise<string> {
  // Convert DB roles ("USER"/"ASSISTANT") to Gemini roles ("user"/"model")
  const contents = history.map((msg) => ({
    role: msg.role === "USER" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents,
  });
  return response.text ?? "";
}
