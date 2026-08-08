"use client";

import { useEffect, useState, type SubmitEvent } from "react";

const STORAGE_KEY = "conversationId";

type Message = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
};

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // On first load: if we saved a conversation id before, fetch its messages.
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (!savedId) return;

    let cancelled = false;

    fetch(`/api/messages?conversationId=${encodeURIComponent(savedId)}`)
      .then(async (res) => {
        if (res.status === 404) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        if (!res.ok) throw new Error("Failed to load history");
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        setConversationId(data.conversationId);
        setMessages(data.messages);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load chat history.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = message.trim();
    if (!text || sending) return;

    setSending(true);
    setError("");

    // Show the user's message immediately (don't wait for the server).
    setMessages((prev) => [
      ...prev,
      {
        id: `local-user-${Date.now()}`,
        role: "USER",
        content: text,
        createdAt: new Date().toISOString(),
      },
    ]);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // Remember this thread so a page refresh reloads the same chat.
      setConversationId(data.conversationId);
      localStorage.setItem(STORAGE_KEY, data.conversationId);

      // Append the AI reply below the user message we already showed.
      setMessages((prev) => [
        ...prev,
        {
          id: `local-assistant-${Date.now()}`,
          role: "ASSISTANT",
          content: data.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSending(false);
    }
  }

  function handleNewChat() {
    localStorage.removeItem(STORAGE_KEY);
    setConversationId(null);
    setMessages([]);
    setError("");
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Web3 Copilot</h1>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleNewChat}
            className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            New chat
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {!sending && messages.length === 0 && (
          <p className="text-zinc-500">No messages yet. Ask something below.</p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              msg.role === "USER" ? "items-end" : "items-start"
            }`}
          >
            <span className="text-xs text-zinc-500">
              {msg.role === "USER" ? "You" : "Copilot"}
            </span>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded px-3 py-2 ${
                msg.role === "USER"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <p className="animate-pulse text-zinc-500">Thinking…</p>
        )}
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="rounded border border-zinc-300 px-4 py-2 disabled:opacity-50 dark:border-zinc-700"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
