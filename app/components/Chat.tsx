"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Sparkles, SendHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const STORAGE_KEY = "conversationId";

type Message = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  toolsUsed?: string[];
};

export default function Chat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to bottom whenever messages list or sending state updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const loadConversation = (savedId: string) => {
    setLoadingHistory(true);
    fetch(`/api/messages?conversationId=${encodeURIComponent(savedId)}`)
      .then(async (res) => {
        if (res.status === 404) {
          localStorage.removeItem(STORAGE_KEY);
          setConversationId(null);
          setMessages([]);
          return null;
        }
        if (!res.ok) throw new Error("Failed to load history");
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setConversationId(data.conversationId);
        setMessages(data.messages);
      })
      .catch(() => {
        setError("Could not load chat history.");
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  };

  // On first load: if we saved a conversation id before, fetch its messages.
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      loadConversation(savedId);
    }

    const handleChatSelected = (e: any) => {
       const newId = e.detail;
       if (newId) {
         loadConversation(newId);
       }
    };
    
    const handleNewChatEvent = () => {
       localStorage.removeItem(STORAGE_KEY);
       setConversationId(null);
       setMessages([]);
       setError("");
    };
    
    window.addEventListener("chat-selected", handleChatSelected);
    window.addEventListener("new-chat", handleNewChatEvent);
    return () => {
      window.removeEventListener("chat-selected", handleChatSelected);
      window.removeEventListener("new-chat", handleNewChatEvent);
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
      const isNewConversation = !conversationId;
      setConversationId(data.conversationId);
      localStorage.setItem(STORAGE_KEY, data.conversationId);

      if (isNewConversation) {
        // Dispatch event so Sidebar knows to refresh
        window.dispatchEvent(new Event("chat-updated"));
      }

      // Append the AI reply below the user message we already showed.
      setMessages((prev) => [
        ...prev,
        {
          id: `local-assistant-${Date.now()}`,
          role: "ASSISTANT",
          content: data.reply,
          toolsUsed: data.toolsUsed,
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
    window.dispatchEvent(new Event("new-chat"));
  }

  return (
    <div className="bg-[#242424] flex flex-col h-full w-full overflow-hidden relative font-sans">
      <div className="p-5 border-b border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-[#d0a786]" />
          <h1 className="text-xl text-gray-200 font-serif">Web3 Copilot</h1>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 md:px-12 py-8 bg-[#242424]">
        {loadingHistory && (
           <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
             <div className="h-16 w-3/4 bg-gray-800/30 rounded-2xl animate-pulse"></div>
             <div className="h-16 w-1/2 bg-gray-800/30 rounded-2xl animate-pulse self-end"></div>
           </div>
        )}
        
        {!loadingHistory && !sending && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <Sparkles className="h-12 w-12 text-[#d0a786] mb-6 opacity-80" />
            <h2 className="text-3xl text-gray-200 font-serif mb-2">Good afternoon, how can I help?</h2>
            <p className="text-gray-500 text-sm">Ask me to analyze a smart contract or review your portfolio.</p>
          </div>
        )}

        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
          {!loadingHistory && messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 w-full ${
                msg.role === "USER" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${msg.role === "USER" ? "bg-gray-700" : "bg-[#d0a786]"}`}>
                {msg.role === "USER" ? <User className="h-4 w-4 text-gray-300" /> : <Sparkles className="h-5 w-5 text-gray-900" />}
              </div>
              <div
                className={`max-w-[85%] px-4 py-3 text-base leading-relaxed text-gray-200 ${
                  msg.role === "USER"
                    ? "bg-[#303030] rounded-2xl rounded-tr-sm whitespace-pre-wrap"
                    : "prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-[#404040] max-w-none"
                }`}
              >
              {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 not-prose">
                  {msg.toolsUsed.map((tool) => (
                    <span key={tool} className="text-[11px] font-mono font-semibold bg-gray-900 border border-gray-700 text-emerald-400 px-2 py-1 rounded-md flex items-center gap-1 shadow-inner">
                      🔧 {tool}
                    </span>
                  ))}
                </div>
              )}
              {msg.role === "USER" ? (
                msg.content
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

          {sending && (
            <div className="flex gap-4 w-full">
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#d0a786]">
                <Sparkles className="h-5 w-5 text-gray-900" />
              </div>
              <div className="flex gap-1.5 p-3 items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: "0ms"}}></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: "150ms"}}></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{animationDelay: "300ms"}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 md:px-12 md:pb-8 bg-[#242424]">
        {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative group">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Web3 Copilot..."
            className="w-full rounded-2xl bg-[#303030] border border-[#404040] pl-5 pr-14 py-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#505050] transition-colors"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="absolute right-3 top-3 p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-[#404040] transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
             <SendHorizontal className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-3">Copilot can make mistakes. Verify critical smart contract insights.</p>
      </div>
    </div>
  );
}
