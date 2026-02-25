"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  Apple,
  UtensilsCrossed,
  MessageCircle,
  CalendarDays,
  BookOpen,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Exercícios", href: "/exercises", icon: Dumbbell },
  { name: "Treinos", href: "/training", icon: ClipboardList },
  { name: "Progresso", href: "/checkins", icon: TrendingUp },
  { name: "Alimentação", href: "/foods", icon: Apple },
  { name: "Nutrição", href: "/nutrition", icon: UtensilsCrossed },
  { name: "Mensagens", href: "/messages", icon: MessageCircle },
  { name: "Agenda", href: "/bookings", icon: CalendarDays },
  { name: "Conteúdos", href: "/content", icon: BookOpen },
  { name: "Funcionários", href: "/employees", icon: UserCog },
  { name: "Definições", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 shrink-0">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-gray-900 tracking-tight leading-tight">MKGest</h1>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest">Personal Trainer</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-500"}`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all duration-150 w-full"
        >
          <ChevronLeft className={`w-[18px] h-[18px] shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span>Recolher</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow-sm rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block h-screen bg-white border-r border-gray-100 sticky top-0 transition-all duration-300 ${collapsed ? "w-[68px]" : "w-56"}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
