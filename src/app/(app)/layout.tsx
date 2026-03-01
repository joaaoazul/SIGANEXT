import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopBar />
        <main className="flex-1">
          <div className="p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
