"use client";

import { Bell, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const pageNames: Record<string, string> = {
  "/dashboard": "Home",
  "/clients": "Clientes",
  "/exercises": "Exercícios",
  "/training": "Treinos",
  "/checkins": "Check-ins",
  "/foods": "Alimentação",
  "/nutrition": "Nutrição",
  "/messages": "Mensagens",
  "/bookings": "Agenda",
  "/content": "Conteúdos",
  "/settings": "Definições",
  "/feedback": "Feedback",
  "/notifications": "Notificações",
  "/profile": "Meu Perfil",
  // Athlete routes
  "/athlete": "Home",
  "/athlete/training": "Meu Treino",
  "/athlete/nutrition": "Minha Nutrição",
  "/athlete/progress": "Meu Progresso",
  "/athlete/bookings": "Minha Agenda",
  "/athlete/payments": "Pagamentos",
  "/athlete/content": "Conteúdos",
  "/athlete/messages": "Mensagens",
  "/athlete/settings": "Definições",
};

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageName = Object.entries(pageNames).find(([path]) =>
    pathname === path || (path !== "/dashboard" && path !== "/athlete" && pathname.startsWith(path))
  )?.[1] || "SIGA180";

  const isAthlete = user?.role === "client";

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d?.id) setUser(d);
    }).catch(() => {});

    // Poll unread notifications (pause when tab is hidden)
    const fetchUnread = () => {
      if (document.hidden) return;
      fetch("/api/notifications").then(r => r.json()).then(d => {
        if (typeof d.unreadCount === "number") setUnreadNotifs(d.unreadCount);
      }).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    const onVisibilityChange = () => { if (!document.hidden) fetchUnread(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVisibilityChange); };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PT";

  return (
    <header className="h-14 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0">
      {/* Left: Page name badge */}
      <div className="flex items-center gap-3">
        <span className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 sm:px-3 py-1 rounded-lg truncate max-w-[160px] sm:max-w-none">
          {pageName}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick add - PT only (hidden while loading or for athletes) */}
        {user && !isAthlete && (
          <Link
            href="/clients"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
            title="Adicionar"
            aria-label="Adicionar"
          >
            <Plus className="w-5 h-5" />
          </Link>
        )}

        {/* Notifications */}
        <Link
          href={isAthlete ? "/athlete/notifications" : "/notifications"}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition relative"
          title="Notificações"
          aria-label={`Notificações${unreadNotifs > 0 ? ` (${unreadNotifs} não lidas)` : ""}`}
        >
          <Bell className="w-5 h-5" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
              {unreadNotifs > 9 ? "9+" : unreadNotifs}
            </span>
          )}
        </Link>

        {/* Avatar + Menu */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            aria-label="Menu de utilizador"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || "Treinador"}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Link href="/profile" onClick={() => setShowMenu(false)} className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Meu Perfil
              </Link>
              <Link href={isAthlete ? "/athlete/settings" : "/settings"} onClick={() => setShowMenu(false)} className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Definições
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                  router.refresh();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
