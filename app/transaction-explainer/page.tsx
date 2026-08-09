"use client";

import { useState } from "react";

export default function TransactionExplainerPage() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleExplain() {
    if (!hash.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/transaction-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: hash.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(`Error: ${data.error ?? "Something went wrong."}`);
      } else {
        setResult(data.explanation);
      }
    } catch {
      setResult("Error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Transaction Explainer</h1>

      {/* Input section */}
      <div className="flex flex-col gap-2">
        <label htmlFor="txHash" className="text-sm font-medium">
          Enter Transaction Hash
        </label>
        <div className="flex gap-2">
          <input
            id="txHash"
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="0xabc123..."
            className="flex-1 rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
          <button
            onClick={handleExplain}
            disabled={loading || !hash.trim()}
            className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "Explaining..." : "Explain"}
          </button>
        </div>
      </div>

      {/* Result section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Result</h2>
        <div className="min-h-[150px] whitespace-pre-wrap rounded border border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          {result || "No transaction explained yet."}
        </div>
      </div>
    </div>
  );
}
