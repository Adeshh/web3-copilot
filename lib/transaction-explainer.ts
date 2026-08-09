import { getTransaction } from "./blockchain";
import { buildTransactionPrompt } from "./prompts";
import { generateReply } from "@/ai/gemini";
import { saveTransactionAnalysis } from "@/db/transactions";

/**
 * Orchestrates the full pipeline:
 * Fetch Tx -> Build Prompt -> Ask Gemini -> Save to DB -> Return Explanation
 */
export async function explainTransaction(txHash: string): Promise<string> {
    // 1. Fetch clean transaction data from blockchain RPC
    const txData = await getTransaction(txHash);

    // 2. Format the data into an AI prompt
    const prompt = buildTransactionPrompt(txData);

    // 3. Call Gemini via your existing AI service
    const explanation = await generateReply([
        { role: "USER", content: prompt }
    ]);

    // 4. Save analysis result to PostgreSQL database
    await saveTransactionAnalysis(txHash, explanation);

    // 5. Return explanation string
    return explanation;
}
