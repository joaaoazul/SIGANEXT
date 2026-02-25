import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8 lg:pl-8 pl-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
