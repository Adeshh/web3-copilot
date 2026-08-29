"use client";
import { useState } from "react";

export default function WalletPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  async function handleSearch(formData: FormData) {
    const searchAddress = formData.get("address") as string;
    if (!searchAddress) return;

    setLoading(true);
    setInsights(null); // Reset previous insights
    
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: searchAddress })
      });
      const result = await res.json();
      setData(result);
      
      // Kick off the AI analysis!
      fetchInsights(searchAddress);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInsights(walletAddress: string) {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/wallet-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress })
      });
      const result = await res.json();
      setInsights(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Wallet Portfolio
          </h1>
          <form action={handleSearch} className="flex gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              name="address"
              placeholder="0x..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
            <button
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Scan"}
            </button>
          </form>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h3 className="text-xl font-bold text-gray-400 mb-4">ETH Balance</h3>
              <p className="text-5xl font-black">{parseFloat(data.ethBalance).toFixed(4)} <span className="text-2xl text-purple-400">ETH</span></p>
              <p className="mt-4 text-gray-500">Active ERC-20 Tokens: {data.tokenCount}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h3 className="text-xl font-bold text-gray-400 mb-4">Recent Transactions</h3>
              <div className="space-y-3 h-64 overflow-y-auto pr-2">
                {data.recentTransactions.map((tx: any) => (
                  <div key={tx.hash} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center border border-gray-700">
                    <div>
                      <p className="font-bold text-sm truncate w-32">{tx.hash}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.timeStamp * 1000).toLocaleDateString()}</p>
                    </div>
                    <span className={tx.to.toLowerCase() === data.address.toLowerCase() ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                      {tx.to.toLowerCase() === data.address.toLowerCase() ? "IN" : "OUT"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Section */}
        {data && (
          <div className="bg-gray-900 mt-8 p-6 rounded-2xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 px-4 py-1 rounded-bl-xl text-xs font-bold">✨ AI Powered</div>
            <h3 className="text-xl font-bold text-gray-200 mb-6">AI Transaction Analysis</h3>
            
            {loadingInsights ? (
              <div className="animate-pulse space-y-4">
                <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                <div className="h-2 bg-gray-700 rounded w-5/6"></div>
                <div className="h-2 bg-gray-700 rounded w-1/2"></div>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-purple-400 font-bold mb-1">Spending Patterns</h4>
                  <p className="text-gray-300">{insights.spendingPatterns}</p>
                </div>
                <div>
                  <h4 className="text-purple-400 font-bold mb-1">DeFi Activity</h4>
                  <p className="text-gray-300">{insights.defiActivity}</p>
                </div>
                {insights.riskFlags && insights.riskFlags.length > 0 && (
                  <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/50">
                    <h4 className="text-red-400 font-bold mb-2">⚠️ Risk Flags Detected</h4>
                    <ul className="list-disc list-inside text-gray-300 text-sm">
                      {insights.riskFlags.map((flag: string, i: number) => <li key={i}>{flag}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
