import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getEthBalance, getTransaction, getTokenInfo } from "@/lib/blockchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {PrismaSaver} from "@/lib/prisma-saver";
import { findRelevantChunks } from "@/lib/retrieval";


const ethBalanceTool = tool(
  async ({ address }) => {
    const balance = await getEthBalance(address);
    return `Balance: ${balance} ETH`;
  },
  {
    name: "getEthBalance",
    description: "Get the Ethereum balance of a specific wallet, contract address or ENS name.",
    schema: z.object({
      address: z.string().describe("The Ethereum address to look up (e.g. vitalik.eth)"),
    }),
  }
);

const transactionTool = tool(
  async ({ txHash }) => {
    const tx = await getTransaction(txHash);
    return JSON.stringify(tx);
  },
  {
    name: "getTransaction",
    description: "Get detailed information about a specific Ethereum transaction.",
    schema: z.object({
      txHash: z.string().describe("The transaction hash starting with 0x..."),
    }),
  }
);

const tokenInfoTool = tool(
  async ({ address }) => {
    const info = await getTokenInfo(address);
    return JSON.stringify(info);
  },
  {
    name: "getTokenInfo",
    description: "Get the name, symbol, and decimals of an ERC-20 token contract.",
    schema: z.object({
      address: z.string().describe("The token contract address starting with 0x..."),
    }),
  }
);

const ragSearchTool = tool(
  async ({ query }) => {
    const chunks = await findRelevantChunks(query, 5);
    return chunks.join("\n\n");
  },
  {
    name: "searchErcDocs",
    description: "Search the ERC standards documentation (ERC-20, ERC-721, ERC-1155) for technical details about token standards, required methods, and events.",
    schema: z.object({
      query: z.string().describe("The search query about ERC standards"),
    }),
  }
);


export const tools = [ethBalanceTool, transactionTool, tokenInfoTool, ragSearchTool];

// 1. Initialize the LLM (Plain instance, no binding needed in v1)
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const checkpointer = new PrismaSaver();
// 2. Build the Autonomous Graph (The Agent) using the new  interface
export const agent = createAgent({
  model: llm,
  tools, //tools we just built
  systemPrompt: "You are a helpful Web3 assistant that helps users understand the blockchain.",
  checkpointer,  //
});

// 3. Helper to run the graph and extract the final message
export async function runAgent(message: string, conversationId: string) {
  const response = await agent.invoke(
    { messages: [new HumanMessage(message)] },
    { configurable: { thread_id: conversationId } }
  );
  const lastMessage = response.messages[response.messages.length - 1];
  
  //Extract all tool calls that happened during this run
  const toolCalls = response.messages
    .filter((msg: any) => msg._getType() === "ai" && msg.tool_calls?.length > 0)
    .flatMap((msg: any) => msg.tool_calls.map((tc: any) => tc.name));
  // 2. Return both the text and the unique tools used
  return {
    content: lastMessage.content as string,
    toolsUsed: Array.from(new Set(toolCalls)) as string[], // Remove duplicates
  };
}
