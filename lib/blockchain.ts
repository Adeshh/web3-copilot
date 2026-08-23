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


export async function getContractSourceCode(address: string) {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) throw new Error("ETHERSCAN_API_KEY is missing in .env");

    const url = `https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "1" || !data.result || data.result.length === 0) {
        throw new Error(`Failed to fetch source code: ${data.message || "Unknown error"}`);
    }

    const sourceCode = data.result[0].SourceCode;
    
    if (!sourceCode) {
         throw new Error("Contract source code not found or not verified on Etherscan.");
    }

    // Sometimes Etherscan wraps multi-file contracts in extra brackets like {{ ... }}
    // We can just return it as a string for the AI to read
    return sourceCode;
}



