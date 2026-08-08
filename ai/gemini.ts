import { GoogleGenAI } from "@google/genai";

export const MODEL = "gemini-3.6-flash";

let client: GoogleGenAI | null = null;

/**
 * Built lazily and reused. Reading the key here rather than at import time
 * means a missing key throws a clear error instead of letting the SDK
 * silently fall back to Vertex AI / ADC.
 */
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Copy .env.example to .env.");
  }

  client ??= new GoogleGenAI({ apiKey });
  return client;
}

/** Send one message to Gemini and return the reply text. */
export async function generateReply(message: string): Promise<string> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: message,
  });

  return response.text ?? "";
}
