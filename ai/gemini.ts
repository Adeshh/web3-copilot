import { GoogleGenAI, Type, Content } from "@google/genai";
import { getEthBalance, getTransaction, getTokenInfo } from "@/lib/blockchain";

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
  description:
    "Get the Ethereum balance of a specific wallet, contract address or ENS name.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      address: {
        type: Type.STRING,
        description:
          "The Ethereum address to look up (e.g., vitalik.eth or 0x123...)",
      },
    },
    required: ["address"],
  },
};

const getTransactionDeclaration = {
  name: "getTransaction",
  description:
    "Get detailed information about a specific Ethereum transaction.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      txHash: {
        type: Type.STRING,
        description: "The transaction hash starting with 0x...",
      },
    },
    required: ["txHash"],
  },
};

const getTokenInfoDeclaration = {
  name: "getTokenInfo",
  description:
    "Get the name, symbol, and decimals of an ERC-20 token contract.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      address: {
        type: Type.STRING,
        description: "The token contract address starting with 0x...",
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
      tools: [
        {
          functionDeclarations: [
            getEthBalanceDeclaration,
            getTransactionDeclaration,
            getTokenInfoDeclaration,
          ],
        },
      ],
    },
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    const call = response.functionCalls[0];
    console.log(`🤖 Executing ${call.name} for`, call.args);
    let result: any = null;

    //ROUTER figure out what to run
    if (call.name === "getEthBalance") {
      const args = call.args as { address: string };
      result = { balance: await getEthBalance(args.address) };
    } else if (call.name === "getTransaction") {
      const args = call.args as { txHash: string };
      result = await getTransaction(args.txHash);
    } else if (call.name === "getTokenInfo") {
      const args = call.args as { address: string };
      result = await getTokenInfo(args.address);
    }

    //Send result back to gemini
    if (result) {
      contents.push(response.candidates![0].content!);
      contents.push({
        role: "user",
        parts: [{ functionResponse: { name: call.name, response: result } }],
      });

      //Call gemini a second time with new context
      const finalResponse = await getClient().models.generateContent({
        model: MODEL,
        contents,
        config: {
          tools: [
            {
              functionDeclarations: [
                getEthBalanceDeclaration,
                getTransactionDeclaration,
                getTokenInfoDeclaration,
              ],
            },
          ],
        },
      });

      return finalResponse.text ?? "";
    }
  }

  return response.text ?? "";
}
