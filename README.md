# 🚀 Web3 Copilot

Web3 Copilot is an intelligent, AI-powered blockchain assistant. It combines the reasoning capabilities of Gemini 1.5 with live blockchain data and vector-based Retrieval-Augmented Generation (RAG) to serve as your ultimate Web3 companion. 

Whether you're analyzing a suspicious smart contract, checking your token portfolio, or asking complex questions about ERC standards, Web3 Copilot handles it all through an intuitive chat interface.



## ✨ Features

- **🧠 Autonomous Agent (LangGraph)**: An intelligent routing agent that dynamically selects the right tools (Etherscan, Alchemy, pgvector) based on your intent.
- **🛡️ Smart Contract Security Auditor**: Paste any Ethereum contract address to receive a comprehensive security analysis for reentrancy, integer overflows, and access control issues.
- **💰 Wallet Portfolio & Insights**: Enter an ENS name or wallet address to see live ETH and ERC-20 balances, alongside an AI behavioral analysis of spending patterns and DeFi activity.
- **📚 RAG-Powered Standards Search**: Ask questions about ERC-20, ERC-721, and other standards. The Copilot retrieves actual technical documentation using pgvector similarity search to provide grounded, hallucination-free answers.
- **🔐 Secure Authentication**: Integrated NextAuth (Auth.js) to keep your chat history strictly private.
- **💾 Persistent Memory**: The LangGraph agent remembers your conversation context across multiple turns, backed by PostgreSQL.
- **🛠️ MCP Server Integration**: Built on the open Model Context Protocol (MCP) standard, allowing the tools to be easily reused by other AI clients.

## 🏗️ Architecture

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes, Vercel Serverless Functions
- **Database**: Neon Serverless PostgreSQL + pgvector
- **ORM**: Prisma ORM 7
- **AI / LLM**: Google Gemini 1.5 Flash via `@langchain/google-genai`
- **Orchestration**: LangGraph.js for stateful agent workflows
- **Blockchain RPC**: ethers.js, Alchemy API, Etherscan API

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- A Neon PostgreSQL database
- API Keys for Gemini, Etherscan, and Alchemy

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/web3-copilot.git
   cd web3-copilot
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Copy `.env.example` to `.env` and fill in your keys:
   ```env
   DATABASE_URL="postgresql://user:password@hostname/db?sslmode=require"
   DIRECT_URL="postgresql://user:password@hostname/db?sslmode=require"
   GEMINI_API_KEY="your-gemini-key"
   ETHEREUM_RPC_URL="your-alchemy-rpc-url"
   ETHERSCAN_API_KEY="your-etherscan-key"
   AUTH_SECRET="generate-a-secure-32-byte-secret"
   ```

4. **Initialize Database:**
   ```bash
   pnpm exec prisma generate
   pnpm exec prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Support

Web3 Copilot includes full Docker support for local development and containerized deployment.

```bash
docker compose up --build
```
This will spin up both the Web3 Copilot application and a local PostgreSQL instance with `pgvector` pre-installed.

## 📜 License
MIT License.
