import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-4 right-4 z-10 flex gap-4">
          <a href="/contract-analyzer" className="bg-gray-800/80 backdrop-blur border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            🛡️ Contract Auditor
          </a>
          <a href="/wallet" className="bg-purple-900/80 backdrop-blur border border-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            💰 Wallet Portfolio
          </a>
        </div>
        <Chat />
      </main>
    </div>
  );
}

