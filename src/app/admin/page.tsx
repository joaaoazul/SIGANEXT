"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Dumbbell,
  UtensilsCrossed,
  MessageSquare,
  CalendarCheck,
  Clock,
  RefreshCcw,
  ArrowRight,
  Shield,
} from "lucide-react";

interface Stats {
  system: {
    totalUsers: number;
    ptUsers: number;
    superadmins: number;
    totalClients: number;
    activeClients: number;
    deletedClients: number;
    usersLast24h: number;
    recentLogins: number;
    recentRegistrations: number;
  };
  content: {
    totalTrainingPlans: number;
    totalNutritionPlans: number;
    totalExercises: number;
    totalFoods: number;
    totalBookings: number;
    totalMessages: number;
    totalCheckIns: number;
  };
  incidents: {
    open: number;
    critical: number;
    recent: Array<{
      id: string;
      title: string;
      severity: string;
      status: string;
      category: string;
      createdAt: string;
    }>;
  };
  recentLogs: Array<{
    id: string;
    action: string;
    entity: string | null;
    userEmail: string | null;
    ip: string | null;
    createdAt: string;
  }>;
}

const severityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  high: "bg-orange-500/10 text-orange-400",
  critical: "bg-red-500/10 text-red-400",
};

const statusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-400",
  investigating: "bg-yellow-500/10 text-yellow-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-gray-500/10 text-gray-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Erro ao carregar dados do sistema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            Painel de Administração
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitorização e gestão do sistema SIGA180
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-600">
              Atualizado: {lastUpdated.toLocaleTimeString("pt-PT")}
            </span>
          )}
          <button
            onClick={() => { setLoading(true); fetchStats(); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Critical alerts */}
      {stats.incidents.critical > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertOctagon className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">
              {stats.incidents.critical} incidente{stats.incidents.critical > 1 ? "s" : ""} crítico{stats.incidents.critical > 1 ? "s" : ""} em aberto
            </p>
            <p className="text-xs text-red-400/70 mt-0.5">Requer atenção imediata</p>
          </div>
          <Link href="/admin/incidents?severity=critical" className="text-red-400 hover:text-red-300 text-sm font-medium">
            Ver &rarr;
          </Link>
        </div>
      )}

      {/* System metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Utilizadores", value: stats.system.totalUsers, icon: Users, color: "text-blue-400" },
          { label: "PTs", value: stats.system.ptUsers, icon: UserCheck, color: "text-emerald-400" },
          { label: "Clientes ativos", value: stats.system.activeClients, icon: Activity, color: "text-purple-400" },
          { label: "Incidentes abertos", value: stats.incidents.open, icon: AlertTriangle, color: "text-yellow-400" },
          { label: "Logins (24h)", value: stats.system.recentLogins, icon: Clock, color: "text-cyan-400" },
          { label: "Ações (24h)", value: stats.system.usersLast24h, icon: Activity, color: "text-orange-400" },
        ].map((m, i) => (
          <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{m.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Content metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Planos Treino", value: stats.content.totalTrainingPlans, icon: Dumbbell },
          { label: "Planos Nutrição", value: stats.content.totalNutritionPlans, icon: UtensilsCrossed },
          { label: "Exercícios", value: stats.content.totalExercises, icon: Activity },
          { label: "Alimentos", value: stats.content.totalFoods, icon: UtensilsCrossed },
          { label: "Marcações", value: stats.content.totalBookings, icon: CalendarCheck },
          { label: "Mensagens", value: stats.content.totalMessages, icon: MessageSquare },
          { label: "Check-ins", value: stats.content.totalCheckIns, icon: Clock },
        ].map((m, i) => (
          <div key={i} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-3">
            <p className="text-lg font-bold text-white">{m.value.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Incidentes Recentes
            </h2>
            <Link href="/admin/incidents" className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.incidents.recent.length === 0 ? (
            <p className="text-sm text-gray-600 py-6 text-center">Sem incidentes registados</p>
          ) : (
            <div className="space-y-2">
              {stats.incidents.recent.map((inc) => (
                <Link
                  key={inc.id}
                  href={`/admin/incidents?id=${inc.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{inc.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {inc.category} &bull; {new Date(inc.createdAt).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${severityColors[inc.severity]}`}>
                    {inc.severity}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[inc.status]}`}>
                    {inc.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              Atividade Recente
            </h2>
            <Link href="/admin/logs" className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentLogs.length === 0 ? (
            <p className="text-sm text-gray-600 py-6 text-center">Sem atividade registada</p>
          ) : (
            <div className="space-y-1">
              {stats.recentLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2 text-xs">
                  <span className="font-mono text-gray-600 w-14 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-yellow-400 font-medium w-24 truncate flex-shrink-0">{log.action}</span>
                  <span className="text-gray-400 truncate flex-1">{log.userEmail || "sistema"}</span>
                  {log.entity && (
                    <span className="text-gray-600 text-[11px]">{log.entity}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System info */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
        <div className="flex flex-wrap gap-6 text-xs text-gray-500">
          <span>Registos última semana: <strong className="text-gray-300">{stats.system.recentRegistrations}</strong></span>
          <span>Clientes eliminados: <strong className="text-gray-300">{stats.system.deletedClients}</strong></span>
          <span>Superadmins: <strong className="text-gray-300">{stats.system.superadmins}</strong></span>
          <span>Total clientes: <strong className="text-gray-300">{stats.system.totalClients}</strong></span>
        </div>
      </div>
    </div>
  );
}
