"use client";
import { useState } from "react";
import { ShieldCheck, Code, AlertTriangle, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#1e1e1e] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Input */}
        <div className="bg-[#242424] p-8 rounded-2xl shadow-xl border border-gray-800/50 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#d0a786] to-transparent opacity-50"></div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-[#d0a786]" />
            <h1 className="text-3xl font-serif text-gray-200">
              Smart Contract Auditor
            </h1>
          </div>
          <p className="text-gray-400 mb-6 text-sm">Enter an Ethereum contract address to instantly generate an AI security analysis.</p>
          
          <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="0xdAC17F958D2ee523a2206206994597C13D831ec7"
              className="flex-1 bg-[#303030] border border-[#404040] rounded-xl px-5 py-3.5 text-gray-200 focus:ring-1 focus:ring-[#505050] outline-none transition-all placeholder-gray-500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <button
              disabled={loading}
              type="submit"
              className="bg-[#d0a786] hover:bg-[#b89070] text-gray-900 px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
            >
              {loading ? "Auditing..." : "Run Audit"}
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 font-semibold text-sm">{error}</p>}
        </div>

        {/* Results Area (Split Pane) */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Source Code */}
            <div className="bg-[#242424] rounded-2xl border border-gray-800/50 flex flex-col h-[700px] shadow-xl">
              <div className="p-4 border-b border-gray-800/50 flex items-center gap-2">
                <Code className="h-4 w-4 text-gray-400" />
                <h3 className="font-semibold text-gray-200 text-sm tracking-wide uppercase">Raw Solidity Code</h3>
              </div>
              <div className="p-5 overflow-y-auto flex-1 font-mono text-[13px] leading-relaxed text-gray-400 bg-[#1e1e1e]/50">
                <pre>{result.sourceCode}</pre>
              </div>
            </div>

            {/* Right: AI Audit Report */}
            <div className="bg-[#242424] rounded-2xl border border-[#d0a786]/20 flex flex-col h-[700px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#d0a786] px-4 py-1 rounded-bl-xl text-xs font-bold text-gray-900 flex items-center gap-1 shadow-md">
                 <Sparkles className="h-3 w-3" /> AI Analysis
              </div>
              <div className="p-5 border-b border-gray-800/50 flex justify-between items-center pr-32">
                <h3 className="font-serif text-xl text-gray-200 flex items-center gap-2">
                  Security Report
                </h3>
                {result.auditReport.overallRisk === "DANGEROUS" && <span className="bg-red-950/50 border border-red-500/50 px-3 py-1 rounded-md text-xs font-bold text-red-400 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> HIGH RISK</span>}
                {result.auditReport.overallRisk === "CAUTION" && <span className="bg-yellow-950/50 border border-yellow-500/50 px-3 py-1 rounded-md text-xs font-bold text-yellow-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> CAUTION</span>}
                {result.auditReport.overallRisk === "SAFE" && <span className="bg-emerald-950/50 border border-emerald-500/50 px-3 py-1 rounded-md text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> SAFE</span>}
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <h4 className="text-[#d0a786] font-semibold text-sm uppercase tracking-wide mb-2">Executive Summary</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.auditReport.summary}</p>
                </div>

                <div className="pt-4 border-t border-gray-800/50">
                  <h4 className="text-lg font-serif text-gray-200 mb-4">Detected Vulnerabilities</h4>
                  {result.auditReport.vulnerabilities.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No major vulnerabilities detected by the AI.</p>
                  ) : (
                    <div className="space-y-4">
                      {result.auditReport.vulnerabilities.map((vuln: any, idx: number) => (
                        <div key={idx} className="bg-[#303030] rounded-xl p-5 border border-[#404040] hover:border-[#505050] transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-semibold text-gray-200 text-base">{vuln.name}</h5>
                            {getSeverityBadge(vuln.severity)}
                          </div>
                          <p className="text-gray-400 mb-3 text-sm leading-relaxed">{vuln.description}</p>
                          {vuln.lineNumbers && vuln.lineNumbers.length > 0 && (
                            <p className="text-xs text-[#d0a786] font-mono mb-1">Lines: {vuln.lineNumbers.join(", ")}</p>
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
