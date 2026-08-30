"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { MessageSquare, Plus, LogOut, MessageCircle } from "lucide-react";

const STORAGE_KEY = "conversationId";

type ConversationItem = {
  id: string;
  title: string | null;
  updatedAt: string;
};

export default function Sidebar() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConversations = () => {
    fetch("/api/conversations", { cache: "no-store" })
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
  };

  useEffect(() => {
    // Read currently active conversation ID from localStorage
    const savedId = localStorage.getItem(STORAGE_KEY);
    setActiveId(savedId);

    // Fetch conversation list from API
    fetchConversations();

    // Event listeners for seamless updates without page reload
    const handleChatUpdated = () => fetchConversations();
    const handleNewChatEvent = () => {
      setActiveId(null);
      localStorage.removeItem(STORAGE_KEY);
    };
    const handleChatSelected = (e: any) => {
       setActiveId(e.detail);
    }

    window.addEventListener("chat-updated", handleChatUpdated);
    window.addEventListener("new-chat", handleNewChatEvent);
    window.addEventListener("chat-selected", handleChatSelected);

    return () => {
      window.removeEventListener("chat-updated", handleChatUpdated);
      window.removeEventListener("new-chat", handleNewChatEvent);
      window.removeEventListener("chat-selected", handleChatSelected);
    };
  }, []);

  function handleSelect(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
    setActiveId(id);
    // Dispatch event so Chat component knows to reload this specific chat
    window.dispatchEvent(new CustomEvent("chat-selected", { detail: id }));
  }

  function handleNewChat() {
    localStorage.removeItem(STORAGE_KEY);
    setActiveId(null);
    window.dispatchEvent(new Event("new-chat"));
  }
  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-800 bg-[#1e1e1e] p-3 text-gray-300">
      <div className="mb-4">
        <button
          type="button"
          onClick={handleNewChat}
          className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1 rounded">
               <Plus className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-200">New Chat</span>
          </div>
        </button>
      </div>

      <div className="px-3 pb-2 pt-2">
        <h2 className="text-xs font-semibold text-gray-500 mb-2 px-1">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1">
        {loading && (
          <p className="text-xs text-gray-500 animate-pulse px-2">Loading history…</p>
        )}

        {error && <p className="text-xs text-red-400 px-2">{error}</p>}

        {!loading && !error && conversations.length === 0 && (
          <p className="text-xs text-gray-500 px-2">No past conversations.</p>
        )}

        <ul className="flex flex-col gap-1.5">
          {conversations.map((item) => {
            const isSelected = item.id === activeId;
            const displayTitle = item.title || "New Chat";

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 text-left truncate rounded-md px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-white/10 text-gray-100 font-medium"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
                  }`}
                >
                  <MessageCircle className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{displayTitle}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Profile Footer */}
      {session?.user && (
        <div className="mt-auto border-t border-gray-800/50 pt-3">
          <div className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors group">
            <div className="flex items-center gap-3 truncate">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {session.user.email?.[0].toUpperCase()}
              </div>
              <div className="truncate text-sm text-gray-300">
                {session.user.email}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
