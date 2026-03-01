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
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  TrendingUp,
  CreditCard,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";

// PT navigation
const ptNavigation = [
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
  { name: "Definições", href: "/settings", icon: Settings },
];

// Athlete navigation
const athleteNavigation = [
  { name: "Home", href: "/athlete", icon: LayoutDashboard },
  { name: "Treino", href: "/athlete/training", icon: Dumbbell },
  { name: "Nutrição", href: "/athlete/nutrition", icon: UtensilsCrossed },
  { name: "Progresso", href: "/athlete/progress", icon: Activity },
  { name: "Agenda", href: "/athlete/bookings", icon: CalendarDays },
  { name: "Pagamentos", href: "/athlete/payments", icon: CreditCard },
  { name: "Conteúdos", href: "/athlete/content", icon: BookOpen },
  { name: "Mensagens", href: "/athlete/messages", icon: MessageCircle },
  { name: "Definições", href: "/athlete/settings", icon: Settings },
];

// Bottom bar items (mobile) - max 5 items, rest go to "more" sheet
const ptBottomNav = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Treinos", href: "/training", icon: ClipboardList },
  { name: "Mensagens", href: "/messages", icon: MessageCircle },
];

const athleteBottomNav = [
  { name: "Home", href: "/athlete", icon: LayoutDashboard },
  { name: "Treino", href: "/athlete/training", icon: Dumbbell },
  { name: "Nutrição", href: "/athlete/nutrition", icon: UtensilsCrossed },
  { name: "Mensagens", href: "/athlete/messages", icon: MessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [role, setRole] = useState<string>("admin");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d?.role) setRole(d.role); })
      .catch(() => {});
  }, []);

  // Close more menu on route change
  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const isAthlete = role === "client";
  const navigation = isAthlete ? athleteNavigation : ptNavigation;
  const bottomNav = isAthlete ? athleteBottomNav : ptBottomNav;
  const brandSubtitle = isAthlete ? "Área do Atleta" : "Personal Trainer";

  // Items not in bottom bar (for the "more" sheet)
  const moreItems = navigation.filter(
    (item) => !bottomNav.some((b) => b.href === item.href)
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/athlete") return pathname === href;
    return pathname.startsWith(href);
  };

  const isMoreActive = moreItems.some((item) => isActive(item.href));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 shrink-0">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-gray-900 tracking-tight leading-tight">SIGA180</h1>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest">{brandSubtitle}</p>
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
      {/* Mobile overlay for sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar drawer (swipe from left) */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block h-screen bg-white border-r border-gray-100 sticky top-0 transition-all duration-300 ${collapsed ? "w-[68px]" : "w-56"}`}>
        {sidebarContent}
      </aside>

      {/* Mobile bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                  active ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-emerald-600" : ""}`} />
                <span className={`text-[10px] font-medium ${active ? "text-emerald-600" : ""}`}>{item.name}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isMoreActive ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? "text-emerald-600" : ""}`} />
            <span className={`text-[10px] font-medium ${isMoreActive ? "text-emerald-600" : ""}`}>Mais</span>
          </button>
        </div>
      </nav>

      {/* "More" bottom sheet */}
      {moreOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setMoreOpen(false)} />
          <div className="lg:hidden fixed bottom-16 left-0 right-0 z-50 bg-white rounded-t-2xl border-t border-gray-200 shadow-2xl safe-area-bottom animate-slide-up">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1" />
            <div className="px-2 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-1">
                {moreItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                      <span className="text-[11px] font-medium text-center">{item.name}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => { setMoreOpen(false); handleLogout(); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-gray-400" />
                  <span className="text-[11px] font-medium">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
