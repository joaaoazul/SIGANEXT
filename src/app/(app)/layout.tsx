import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ReconsentBanner from "@/components/ReconsentBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium">
        Saltar para conteúdo
      </a>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopBar />
        <main id="main-content" className="flex-1" role="main">
          <div className="p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
        <ReconsentBanner />
      </div>
    </div>
  );
}
