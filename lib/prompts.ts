export type TransactionSummary = {
  hash: string;
  from: string;
  to: string | null;
  valueEth: string;
  gasLimit: string;
  data: string;
  blockNumber: number | null;
};

export function buildTransactionPrompt(tx: TransactionSummary):string {
    const isContractCall = tx.data !== "0x" && tx.data !== "";

    return `Explain this blockchain transaction to a begineer in clear, simple terms.
    Transaction Data:
    - Hash: ${tx.hash}
    - From (Sender): ${tx.from}
    - To (Recipient/Contract): ${tx.to ?? "Contract Creation"}
    - Value: ${tx.valueEth} ETH
    - Gas Limit: ${tx.gasLimit}
    - Block Number: ${tx.blockNumber ?? "Pending"}
    - Transaction Type: ${isContractCall ? "Smart Contract Interaction (Calldata present)" : "Simple Native ETH Transfer"}
    Please summarize:
    1. What occurred in this transaction.
    2. How much ETH was transferred.
    3. Whether it was a direct transfer or a smart contract call.
    4. Estimate purpose
    5. Gas implication in usd
    Keep the explanation clear, accurate, and easy for a non-technical person to read.
    `.trim();

}

export const AUDITOR_PROMPT = `
You are a senior smart contract auditor.
Analyze the following Solidity code for:
1. Reentrancy vulnerabilities
2. Integer overflow/underflow
3. Access control issues
4. Unchecked external calls

Return your analysis strictly as a JSON object matching this structure:
{
  "vulnerabilities": [
    {
      "type": "string (e.g. Reentrancy)",
      "severity": "High" | "Medium" | "Low",
      "description": "Detailed explanation of the issue",
      "recommendation": "How to fix it"
    }
  ],
  "summary": "A brief overview of the contract's overall security posture."
}

Do not include any markdown formatting or conversational text. Return ONLY the raw JSON.
`;
