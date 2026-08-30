"use client";
import { useState } from "react";
import { Wallet, Search, Activity, Sparkles, ArrowDownRight, ArrowUpRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#1e1e1e] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="bg-[#242424] p-8 rounded-2xl shadow-xl border border-gray-800/50 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#d0a786] to-transparent opacity-50"></div>
          <div className="flex justify-center mb-4">
             <div className="p-3 bg-[#d0a786]/10 rounded-full">
               <Wallet className="h-8 w-8 text-[#d0a786]" />
             </div>
          </div>
          <h1 className="text-3xl font-serif mb-6 text-gray-200">
            Wallet Portfolio
          </h1>
          <form action={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto relative group">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                name="address"
                placeholder="0xdAC17F958D2ee523a2206206994597C13D831ec7"
                className="w-full bg-[#303030] border border-[#404040] rounded-xl pl-12 pr-4 py-3.5 text-gray-200 focus:ring-1 focus:ring-[#505050] outline-none transition-all placeholder-gray-500"
                required
              />
            </div>
            <button
              disabled={loading}
              className="bg-[#d0a786] hover:bg-[#b89070] text-gray-900 px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Scan Wallet"}
            </button>
          </form>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#242424] p-6 rounded-2xl border border-gray-800/50 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total ETH Balance</h3>
              <div className="flex items-end gap-2">
                 <p className="text-5xl font-bold text-gray-100">{parseFloat(data.ethBalance).toFixed(4)}</p>
                 <span className="text-xl text-gray-400 font-medium pb-1">ETH</span>
              </div>
              <div className="mt-6 flex items-center justify-between bg-[#303030] p-4 rounded-xl border border-[#404040]">
                 <span className="text-gray-400 text-sm">Active ERC-20 Tokens</span>
                 <span className="font-bold text-xl text-gray-200">{data.tokenCount}</span>
              </div>
            </div>

            <div className="bg-[#242424] p-6 rounded-2xl border border-gray-800/50 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                 <Activity className="h-4 w-4 text-gray-400" />
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Transactions</h3>
              </div>
              <div className="space-y-3 h-[140px] overflow-y-auto pr-2">
                {data.recentTransactions.map((tx: any) => (
                  <div key={tx.hash} className="bg-[#303030] p-3 rounded-xl flex justify-between items-center border border-[#404040] hover:border-[#505050] transition-colors">
                    <div>
                      <p className="font-mono text-xs text-gray-300 w-32 truncate">{tx.hash}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{new Date(tx.timeStamp * 1000).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {tx.to.toLowerCase() === data.address.toLowerCase() ? (
                        <span className="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                           <ArrowDownRight className="h-3 w-3" /> IN
                        </span>
                      ) : (
                        <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                           <ArrowUpRight className="h-3 w-3" /> OUT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Section */}
        {data && (
          <div className="bg-[#242424] mt-6 p-6 rounded-2xl border border-[#d0a786]/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#d0a786] px-4 py-1 rounded-bl-xl text-xs font-bold text-gray-900 flex items-center gap-1 shadow-md">
               <Sparkles className="h-3 w-3" /> AI Analysis
            </div>
            <h3 className="text-xl font-serif text-gray-200 mb-6 flex items-center gap-2">
              Behavioral Insights
            </h3>
            
            {loadingInsights ? (
              <div className="animate-pulse space-y-4 max-w-2xl">
                <div className="h-2 bg-[#404040] rounded w-3/4"></div>
                <div className="h-2 bg-[#404040] rounded w-5/6"></div>
                <div className="h-2 bg-[#404040] rounded w-1/2"></div>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#d0a786] font-semibold text-sm uppercase tracking-wide mb-2">Spending Patterns</h4>
                  <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">{insights.spendingPatterns}</p>
                </div>
                <div>
                  <h4 className="text-[#d0a786] font-semibold text-sm uppercase tracking-wide mb-2">DeFi Activity</h4>
                  <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">{insights.defiActivity}</p>
                </div>
                {insights.riskFlags && insights.riskFlags.length > 0 && (
                  <div className="bg-red-950/20 p-5 rounded-xl border border-red-900/50 max-w-3xl">
                    <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                       ⚠️ Risk Flags Detected
                    </h4>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
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
