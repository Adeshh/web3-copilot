"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "conversationId";

type ConversationItem = {
  id: string;
  title: string | null;
  updatedAt: string;
};

export default function Sidebar() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Read currently active conversation ID from localStorage
    const savedId = localStorage.getItem(STORAGE_KEY);
    setActiveId(savedId);

    // Fetch conversation list from API
    fetch("/api/conversations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load conversations");
        return res.json();
      })
      .then((data) => {
        setConversations(data.conversations ?? []);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load conversations");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleSelect(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
    setActiveId(id);
    // Reload window so Chat component re-fetches history for selected conversation
    window.location.reload();
  }

  function handleNewChat() {
    localStorage.removeItem(STORAGE_KEY);
    setActiveId(null);
    window.location.reload();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-400 uppercase">
          Conversations
        </h2>
        <button
          type="button"
          onClick={handleNewChat}
          className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="text-xs text-zinc-500 animate-pulse">Loading history…</p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        {!loading && !error && conversations.length === 0 && (
          <p className="text-xs text-zinc-500">No past conversations.</p>
        )}

        <ul className="flex flex-col gap-1">
          {conversations.map((item) => {
            const isSelected = item.id === activeId;
            const displayTitle = item.title || "New Chat";

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full text-left truncate rounded px-3 py-2 text-xs transition-colors ${
                    isSelected
                      ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  {displayTitle}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
