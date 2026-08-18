import { JsonRpcProvider, formatEther, Contract } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

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

export async function getTokenInfo(contractAddress: string) {
    const contract = new Contract(contractAddress, ERC20_ABI, provider);

    //We promise.all to fetch all 3 at the same time to make it faster. catch also if contract is not ERC20
    const[name, symbol, decimals] = await Promise.all([
        contract.name().catch(()=>"Unknown"),
        contract.symbol().catch(()=>"???"),
        contract.decimals().catch(()=>18),
        
    ]);
    return { name, symbol, decimals: Number(decimals) };
}


