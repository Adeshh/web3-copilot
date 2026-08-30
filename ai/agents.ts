import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {PrismaSaver} from "@/lib/prisma-saver";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { server } from "@/mcp/server";

//setup global client cache to prevent spawning hundreds of process in dev
const globalForMcp = globalThis as unknown as {mcpClient: Client | undefined};

class InMemoryTransport implements Transport {
  public onmessage?: (message: JSONRPCMessage) => void;
  public onclose?: () => void;
  public onerror?: (error: Error) => void;
  public target?: InMemoryTransport;

  async start() {}
  async close() { this.onclose?.(); }
  async send(message: JSONRPCMessage) {
    // Avoid maximum call stack size exceeded
    setTimeout(() => {
      this.target?.onmessage?.(message);
    }, 0);
  }
}

async function getMcpClient() {
  if (globalForMcp.mcpClient) return globalForMcp.mcpClient;
  
  // In-memory transport (no child process overhead)
  const clientTransport = new InMemoryTransport();
  const serverTransport = new InMemoryTransport();
  clientTransport.target = serverTransport;
  serverTransport.target = clientTransport;
  
  await server.connect(serverTransport as any);
  let transport = clientTransport;

  const client = new Client(
    { name: "Web3 Copilot Next.js App", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(transport as any);
  globalForMcp.mcpClient = client;
  return client;
}

async function getDynamicTools() {
  const client = await getMcpClient();
  
  // Ask the server what tools it provides
  const { tools: mcpTools } = await client.listTools();

  // Map them into LangChain tools
  return mcpTools.map((mcpTool) => {
    return tool(
      async (args) => {
        // When the AI decides to use this tool, forward the request to the MCP server
        const result = await client.callTool({
          name: mcpTool.name,
          arguments: args as Record<string, unknown>,
        });
        
        // Extract the text response from the MCP server
        const content = (result as any).content || [];
        return content.map((c: any) => c.type === 'text' ? c.text : '').join('\n');
      },
      {
        name: mcpTool.name,
        description: mcpTool.description || "",
        schema: mcpTool.inputSchema as any, // Pass the Zod schema directly from MCP
      }
    );
  });
}




// 1. Initialize the LLM (Plain instance, no binding needed in v1)
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const checkpointer = new PrismaSaver();

// 2. Helper to run the graph and extract the final message
export async function runAgent(message: string, conversationId: string) {
  // Fetch the dynamic tools from the MCP server
  const tools = await getDynamicTools();

  // Build the Autonomous Graph (The Agent) using the new interface
  const agent = createAgent({
    model: llm,
    tools: tools,
    systemPrompt: "You are a helpful Web3 assistant that helps users understand the blockchain.",
    checkpointer: checkpointer,
  });

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
