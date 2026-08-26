"use client";

import { useState } from "react";

export default function ContractAnalyzerPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/contract-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Helper for color coding the severities
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">CRITICAL</span>;
      case "HIGH": return <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">HIGH</span>;
      case "MEDIUM": return <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">MEDIUM</span>;
      case "LOW": return <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">LOW</span>;
      default: return <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-bold">{severity}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Input */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-800">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Smart Contract Auditor
          </h1>
          <p className="text-gray-400 mb-6">Enter an Ethereum contract address to instantly generate an AI security analysis.</p>
          
          <form onSubmit={handleAudit} className="flex gap-4">
            <input
              type="text"
              placeholder="0xdAC17F958D2ee523a2206206994597C13D831ec7"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <button
              disabled={loading}
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Auditing..." : "Run Audit"}
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 font-semibold">{error}</p>}
        </div>

        {/* Results Area (Split Pane) */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Source Code */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col h-[800px]">
              <div className="p-4 border-b border-gray-800 bg-gray-800/50 rounded-t-2xl">
                <h3 className="font-bold text-gray-200">Raw Solidity Code</h3>
              </div>
              <div className="p-4 overflow-y-auto flex-1 font-mono text-sm text-gray-400">
                <pre>{result.sourceCode}</pre>
              </div>
            </div>

            {/* Right: AI Audit Report */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 flex flex-col h-[800px]">
              <div className="p-4 border-b border-gray-800 bg-gray-800/50 rounded-t-2xl flex justify-between items-center">
                <h3 className="font-bold text-gray-200">AI Security Report</h3>
                {result.auditReport.overallRisk === "DANGEROUS" && <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]">HIGH RISK</span>}
                {result.auditReport.overallRisk === "CAUTION" && <span className="bg-yellow-500 px-3 py-1 rounded-full text-xs font-bold text-black">USE CAUTION</span>}
                {result.auditReport.overallRisk === "SAFE" && <span className="bg-emerald-500 px-3 py-1 rounded-full text-xs font-bold text-white">SAFE</span>}
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl">
                  <h4 className="text-blue-400 font-bold mb-2">Executive Summary</h4>
                  <p className="text-gray-300 leading-relaxed">{result.auditReport.summary}</p>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-4">Detected Vulnerabilities</h4>
                  {result.auditReport.vulnerabilities.length === 0 ? (
                    <p className="text-gray-400 italic">No major vulnerabilities detected by the AI.</p>
                  ) : (
                    <div className="space-y-4">
                      {result.auditReport.vulnerabilities.map((vuln: any, idx: number) => (
                        <div key={idx} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-bold text-lg">{vuln.name}</h5>
                            {getSeverityBadge(vuln.severity)}
                          </div>
                          <p className="text-gray-400 mb-3 text-sm leading-relaxed">{vuln.description}</p>
                          {vuln.lineNumbers && vuln.lineNumbers.length > 0 && (
                            <p className="text-xs text-blue-400 font-mono mb-2">Lines: {vuln.lineNumbers.join(", ")}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
