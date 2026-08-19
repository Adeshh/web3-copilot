import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getEthBalance, getTransaction, getTokenInfo } from "@/lib/blockchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

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

export const tools = [ethBalanceTool, transactionTool, tokenInfoTool];

// 1. Initialize the LLM (Plain instance, no binding needed in v1)
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

// 2. Build the Autonomous Graph (The Agent) using the new  interface
export const agent = createAgent({
  model: llm,
  tools, //tools we just built
  systemPrompt: "You are a helpful Web3 assistant that helps users understand the blockchain.",
});

// 3. Helper to run the graph and extract the final message
export async function runAgent(history: { role: string; content: string }[]) {
  // Convert our DB history into LangChain's message format
  const messages = history.map((msg) =>
    msg.role === "USER" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
  );

  // RUN THE GRAPH! This will loop infinitely until it solves the problem
  const response = await agent.invoke({ messages });

  // The graph returns the entire conversation history. We just want the very last message.
  const lastMessage = response.messages[response.messages.length - 1];
  return lastMessage.content as string;
}
