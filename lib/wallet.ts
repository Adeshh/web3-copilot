import { ethers } from "ethers";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const RPC_URL = process.env.ETHEREUM_RPC_URL!; // Your Alchemy URL

export async function getWalletOverview(address: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // 1. Get ETH Balance
  const balanceWei = await provider.getBalance(address);
  const ethBalance = ethers.formatEther(balanceWei);

  // 2. Get Top ERC-20 Token Balances via Alchemy's custom RPC method
  const tokenBalancesResponse = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "alchemy_getTokenBalances",
      params: [address, "erc20"],
      id: 42
    })
  }).then(res => res.json());

  // Filter out zero balances
  const tokens = tokenBalancesResponse.result?.tokenBalances?.filter(
    (t: any) => t.tokenBalance !== "0x0" && t.tokenBalance !== "0x"
  ).slice(0, 10) || [];

  // 3. Get Recent 10 Transactions via Etherscan V2
  const txUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
  const txResponse = await fetch(txUrl).then(res => res.json());
  
  return {
    address,
    ethBalance,
    tokenCount: tokens.length,
    recentTransactions: Array.isArray(txResponse.result) ? txResponse.result : [],
    rawTokens: tokens // We'll refine these later
  };
}
