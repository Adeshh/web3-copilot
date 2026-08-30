import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import your existing tools and logic
import { getTransaction, getTokenInfo, getEthBalance, getContractSourceCode } from "@/lib/blockchain";
import { findRelevantChunks } from "@/lib/retrieval";
import { analyzeContract } from "@/lib/contract-analyzer";
import { getWalletOverview } from "@/lib/wallet";
import { getWalletInsights } from "@/lib/ai-insights";

// 1. Initialize the modern MCP Server
const server = new McpServer({
  name: "Web3 Copilot MCP Server",
  version: "1.0.0",
});

// 2. Register tools using the modern registerTool method

server.registerTool(
  "getEthBalance",
  {
    description: "Get the Ethereum balance of a specific wallet, contract address or ENS name.",
    inputSchema: { address: z.string() }
  },
  async ({ address }) => {
    try {
      const balance = await getEthBalance(address);
      return { content: [{ type: "text", text: `Balance: ${balance} ETH` }] };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.registerTool(
  "getTransaction",
  {
    description: "Get detailed information about a specific Ethereum transaction.",
    inputSchema: { txHash: z.string() }
  },
  async ({ txHash }) => {
    try {
      const tx = await getTransaction(txHash);
      return { content: [{ type: "text", text: JSON.stringify(tx, null, 2) }] };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.registerTool(
  "getTokenInfo",
  {
    description: "Get the name, symbol, and decimals of an ERC-20 token contract.",
    inputSchema: { address: z.string() }
  },
  async ({ address }) => {
    try {
      const info = await getTokenInfo(address);
      return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.registerTool(
  "searchErcDocs",
  {
    description: "Search the ERC standards documentation for technical details about token standards, required methods, and events.",
    inputSchema: { query: z.string() }
  },
  async ({ query }) => {
    try {
      const chunks = await findRelevantChunks(query, 5);
      return { content: [{ type: "text", text: chunks.join("\n\n") }] };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.registerTool(
    "getContractSourceCode",
    {
        description: "Fetch the verified Solidity source code of a smart contract from Etherscan.",
        inputSchema: { address: z.string() }
    },
    async ({ address }) => {
        try {
        const sourceCode = await getContractSourceCode(address);
        return { content: [{ type: "text", text: sourceCode }] };
        } catch (error: any) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
)


server.registerTool(
  "auditContract",
  {
    description: "Performs a deep security audit on a smart contract using RAG and known vulnerabilities. Use this when the user asks to analyze or audit a contract address.",
    inputSchema: { address: z.string() }
  },
  async ({ address }) => {
    try {
      const report = await analyzeContract(address);
      return {
        content: [{
          type: "text",
          text: `Audit Complete for ${address}:\nSummary: ${report.summary}\nOverall Risk: ${report.overallRisk}\nVulnerabilities found: ${Array.isArray(report.vulnerabilities) ? report.vulnerabilities.length : 0}`
        }]
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Failed to audit contract: ${e.message}` }], isError: true };
    }
  }
);

server.registerTool(
  "getWalletInsights",
  {
    description: "Fetches a comprehensive portfolio overview and AI behavioral analysis of an Ethereum wallet (ETH balance, tokens, spending patterns, risk flags).",
    inputSchema: { address: z.string() }
  },
  async ({ address }) => {
    try {
      const overview = await getWalletOverview(address);
      const insights = await getWalletInsights(overview.recentTransactions);
      return {
        content: [{
          type: "text",
          text: `Wallet Analysis for ${address}:\n\nETH Balance: ${overview.ethBalance}\nActive ERC20 Tokens: ${overview.tokenCount}\n\nSpending Patterns: ${insights.spendingPatterns}\nDeFi Activity: ${insights.defiActivity}\nRisk Flags: ${insights.riskFlags.join(", ") || "None detected"}`
        }]
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Failed to analyze wallet: ${e.message}` }], isError: true };
    }
  }
);

// 3. Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Web3 Copilot MCP Server running on stdio");
}

main().catch(console.error);
