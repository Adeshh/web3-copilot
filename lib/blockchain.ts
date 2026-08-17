import { JsonRpcProvider, formatEther } from "ethers";

const RPC_URL = process.env.ETHEREUM_RPC_URL || "https://cloudflare-eth.com";
const provider = new JsonRpcProvider(RPC_URL);

export async function getTransaction(txHash: string) {
    // Fetch raw transaction from the RPC node
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
        throw new Error("Transaction not found");
    }

    // Return a clean object — no raw bigints or hex noise
    return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        valueEth: formatEther(tx.value),    // Convert Wei → ETH
        gasLimit: tx.gasLimit.toString(),
        data: tx.data,
        blockNumber: tx.blockNumber,
    };
}

export async function getEthBalance(address: string) {
    const balanceWei = await provider.getBalance(address);
    return formatEther(balanceWei); // Converts massive numbers to regular ETH
}


