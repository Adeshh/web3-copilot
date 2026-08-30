import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, Wallet } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e] font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative min-w-0">
        <div className="absolute top-4 right-5 z-10 flex gap-3">
          <a
            href="/contract-analyzer"
            className="flex items-center gap-2 bg-[#242424] hover:bg-[#303030] text-gray-300 px-4 py-2 rounded-xl text-sm shadow-md transition-colors border border-[#404040] hover:border-[#505050] font-medium"
          >
            <ShieldCheck className="h-4 w-4 text-[#d0a786]" />
            Analyzer
          </a>
          <a
            href="/wallet"
            className="flex items-center gap-2 bg-[#242424] hover:bg-[#303030] text-gray-300 px-4 py-2 rounded-xl text-sm shadow-md transition-colors border border-[#404040] hover:border-[#505050] font-medium"
          >
            <Wallet className="h-4 w-4 text-[#d0a786]" />
            Portfolio
          </a>
        </div>
        <div className="flex-1 h-full w-full relative z-0">
          <Chat />
        </div>
      </main>
    </div>
  );
}

