import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const InsightsSchema = z.object({
  spendingPatterns: z.string().describe("Summary of how this wallet spends its ETH/tokens."),
  defiActivity: z.string().describe("Summary of DeFi interactions (e.g., 'Heavy Uniswap user')."),
  riskFlags: z.array(z.string()).describe("Any suspicious activity, interactions with known mixers, or high failure rates. Return empty array if safe.")
});

export async function getWalletInsights(transactions: any[]) {
  const simplifiedTxs = transactions.map(tx => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    valueEth: (Number(tx.value) / 1e18).toFixed(4),
    isError: tx.isError === "1"
  }));

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    apiKey: process.env.GEMINI_API_KEY,
  });

  const structuredLlm = llm.withStructuredOutput(InsightsSchema, { name: "WalletInsights" });

  const prompt = `You are a blockchain forensic analyst. Analyze these recent transactions for a single wallet.
  Transactions: ${JSON.stringify(simplifiedTxs, null, 2)}`;

  return structuredLlm.invoke([{ role: "user", content: prompt }]);
}
