import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import {
  Users,
  Dumbbell,
  UtensilsCrossed,
  CalendarDays,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  CreditCard,
  Heart,
  Zap,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import ToolsWidget from "@/components/ToolsWidget";

async function getStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalClients,
      activeClients,
      pendingPayments,
      overduePayments,
      totalExercises,
      totalTrainingPlans,
      totalNutritionPlans,
      pendingFeedbacks,
      upcomingBookings,
      todayBookings,
      recentClients,
      recentFeedbacks,
      todayCheckins,
      totalCheckins,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "active" } }),
      prisma.client.count({ where: { paymentStatus: "pending" } }),
      prisma.client.count({ where: { paymentStatus: "overdue" } }),
      prisma.exercise.count(),
      prisma.trainingPlan.count(),
      prisma.nutritionPlan.count(),
      prisma.feedback.count({ where: { status: "pending" } }),
      prisma.booking.count({
        where: {
          date: { gte: new Date() },
          status: "confirmed",
        },
      }),
      prisma.booking.findMany({
        where: {
          date: { gte: today, lt: tomorrow },
          status: "confirmed",
        },
        include: {
          client: { select: { name: true, avatar: true } },
          bookingSlot: { select: { startTime: true, endTime: true } },
        },
        orderBy: { date: "asc" },
        take: 8,
      }),
      prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, status: true, createdAt: true },
      }),
      prisma.feedback.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true } } },
      }),
      prisma.checkIn.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        include: { client: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.checkIn.count({ where: { date: { gte: today, lt: tomorrow } } }),
    ]);

    // Compute avg wellness from today's checkins
    const wellnessCheckins = todayCheckins.filter(c => c.mood);
    const avgMood = wellnessCheckins.length ? (wellnessCheckins.reduce((s, c) => s + (c.mood || 0), 0) / wellnessCheckins.length) : 0;
    const avgEnergy = wellnessCheckins.length ? (wellnessCheckins.reduce((s, c) => s + (c.energy || 0), 0) / wellnessCheckins.length) : 0;

    return {
      totalClients,
      activeClients,
      pendingPayments,
      overduePayments,
      totalExercises,
      totalTrainingPlans,
      totalNutritionPlans,
      pendingFeedbacks,
      upcomingBookings,
      todayBookings,
      recentClients,
      recentFeedbacks,
      todayCheckins,
      totalCheckins,
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      totalClients: 0, activeClients: 0, pendingPayments: 0, overduePayments: 0,
      totalExercises: 0, totalTrainingPlans: 0, totalNutritionPlans: 0, pendingFeedbacks: 0,
      upcomingBookings: 0, todayBookings: [], recentClients: [], recentFeedbacks: [],
      todayCheckins: [], totalCheckins: 0, avgMood: "0", avgEnergy: "0",
    };
  }
}

export default async function DashboardPage() {
  const user = await getUser();
  const stats = await getStats();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 19) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(" ")[0] || "Treinador"}
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {(stats.overduePayments > 0 || stats.pendingFeedbacks > 0) && (
        <div className="space-y-2">
          {stats.overduePayments > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 text-sm flex-1">
                <strong>{stats.overduePayments}</strong> pagamento(s) em atraso
              </p>
              <Link href="/clients" className="text-xs font-medium text-red-600 hover:underline">Ver →</Link>
            </div>
          )}
          {stats.pendingFeedbacks > 0 && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <MessageSquare className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-amber-700 text-sm flex-1">
                <strong>{stats.pendingFeedbacks}</strong> feedback(s) por analisar
              </p>
              <Link href="/feedback" className="text-xs font-medium text-amber-600 hover:underline">Ver →</Link>
            </div>
          )}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/clients" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
          <p className="text-xs text-gray-500 mt-0.5">Atletas ativos</p>
        </Link>
        <Link href="/training" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Dumbbell className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTrainingPlans}</p>
          <p className="text-xs text-gray-500 mt-0.5">Planos de treino</p>
        </Link>
        <Link href="/nutrition" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <UtensilsCrossed className="w-4.5 h-4.5 text-orange-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalNutritionPlans}</p>
          <p className="text-xs text-gray-500 mt-0.5">Planos nutrição</p>
        </Link>
        <Link href="/bookings" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CalendarDays className="w-4.5 h-4.5 text-indigo-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sessões agendadas</p>
        </Link>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Sessions - takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-base font-semibold text-gray-900">Sessões de Hoje</h2>
            <Link href="/bookings" className="text-xs font-medium text-emerald-600 hover:underline">Ver agenda →</Link>
          </div>
          <div className="p-5">
            {stats.todayBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Sem sessões para hoje</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.todayBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-semibold flex-shrink-0">
                      {booking.client.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{booking.client.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.bookingSlot.startTime} - {booking.bookingSlot.endTime}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">Confirmado</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wellness Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-base font-semibold text-gray-900">Bem-estar Hoje</h2>
            <Link href="/checkins" className="text-xs font-medium text-emerald-600 hover:underline">Check-ins →</Link>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <Heart className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{stats.avgMood}</p>
                <p className="text-[11px] text-gray-500">Humor médio</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{stats.avgEnergy}</p>
                <p className="text-[11px] text-gray-500">Energia média</p>
              </div>
            </div>
            <div className="text-center py-2">
              <p className="text-3xl font-bold text-gray-900">{stats.totalCheckins}</p>
              <p className="text-xs text-gray-500">check-ins hoje</p>
            </div>
            {stats.todayCheckins.length > 0 && (
              <div className="space-y-2 border-t border-gray-50 pt-3">
                {stats.todayCheckins.slice(0, 4).map((ci) => (
                  <div key={ci.id} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-semibold">
                      {ci.client.name.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-700 flex-1 truncate">{ci.client.name}</span>
                    {ci.mood && (
                      <span className={`text-xs font-medium ${ci.mood >= 4 ? "text-emerald-500" : ci.mood >= 3 ? "text-yellow-500" : "text-red-500"}`}>
                        {ci.mood}/5
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-base font-semibold text-gray-900">Novos Atletas</h2>
            <Link href="/clients" className="text-xs font-medium text-emerald-600 hover:underline">Ver todos →</Link>
          </div>
          <div className="p-5">
            {stats.recentClients.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">Nenhum cliente registado</p>
            ) : (
              <div className="space-y-2">
                {stats.recentClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-semibold">
                      {client.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                      <p className="text-xs text-gray-400">{new Date(client.createdAt).toLocaleDateString("pt-PT")}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      client.status === "active" ? "bg-emerald-50 text-emerald-600" : client.status === "pending" ? "bg-yellow-50 text-yellow-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {client.status === "active" ? "Ativo" : client.status === "pending" ? "Pendente" : "Inativo"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 pb-0">
            <h2 className="text-base font-semibold text-gray-900">Resumo Geral</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Users className="w-4 h-4 text-emerald-500" /></div>
                <span className="text-sm text-gray-600">Total clientes</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalClients}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Dumbbell className="w-4 h-4 text-purple-500" /></div>
                <span className="text-sm text-gray-600">Exercícios</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalExercises}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center"><CreditCard className="w-4 h-4 text-yellow-500" /></div>
                <span className="text-sm text-gray-600">Pagamentos pendentes</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.pendingPayments}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-blue-500" /></div>
                <span className="text-sm text-gray-600">Planos de treino</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalTrainingPlans}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><UtensilsCrossed className="w-4 h-4 text-orange-500" /></div>
                <span className="text-sm text-gray-600">Planos de nutrição</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.totalNutritionPlans}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ferramentas do PT */}
      <ToolsWidget />
    </div>
  );
}
