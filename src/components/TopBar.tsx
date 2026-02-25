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
  "/employees": "Funcionários",
  "/settings": "Definições",
  "/feedback": "Feedback",
  "/notifications": "Notificações",
};

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageName = Object.entries(pageNames).find(([path]) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
  )?.[1] || "SIGA180";

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
    }).catch(() => {});
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
    <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left: Page name badge */}
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
          {pageName}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick add */}
        <Link
          href="/clients"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition"
          title="Adicionar"
        >
          <Plus className="w-5 h-5" />
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition relative"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
        </Link>

        {/* Avatar + Menu */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name || "Treinador"}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Link href="/settings" onClick={() => setShowMenu(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                Definições
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                  router.refresh();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
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
