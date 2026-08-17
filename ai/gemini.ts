import { GoogleGenAI, Type, Content } from "@google/genai";
import { getEthBalance } from "@/lib/blockchain";

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

const getEthBalanceDeclaration = {
  name: "getEthBalance",
  description: "Get the Ethereum balance of a specific wallet, contract address or ENS name.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      address: {
        type: Type.STRING,
        description: "The Ethereum address to look up (e.g., vitalik.eth or 0x123...)",
      },
    },
    required: ["address"],
  },
};

export type MessageInput = {
  role: "USER" | "ASSISTANT";
  content: string;
};

/** Send one message to Gemini and return the reply text. */
export async function generateReply(history: MessageInput[]): Promise<string> {
  // Convert DB roles ("USER"/"ASSISTANT") to Gemini roles ("user"/"model")
  const contents: Content[] = history.map((msg) => ({
    role: msg.role === "USER" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents,
    config: {
      tools: [{ functionDeclarations: [getEthBalanceDeclaration] }],
    }
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    const call = response.functionCalls[0];
    console.log(`🤖 Executing ${call.name} for`, call.args);
    if (call.name === "getEthBalance") {
      // 1. Actually run the code!
      const args = call.args as { address: string };
      const balance = await getEthBalance(args.address);
      // 2. Add the AI's exact request and our result to the conversation history
      contents.push(
        response.candidates![0].content!,
        {
          role: "user",
          parts: [{ functionResponse: { name: call.name, response: { balance } } }],
        }
      );
      // 3. Call Gemini a SECOND time with the new context so it can answer the user
      const finalResponse = await getClient().models.generateContent({
        model: MODEL,
        contents,
        config: { tools: [{ functionDeclarations: [getEthBalanceDeclaration] }] }
      });
      
      return finalResponse.text ?? "";
    }
  }

  return response.text ?? "";
}
