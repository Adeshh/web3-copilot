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
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}

