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
    Keep the explanation clear, accurate, and easy for a non-technical person to read.
    `.trim();

}