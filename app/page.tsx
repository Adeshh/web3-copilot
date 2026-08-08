import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}

