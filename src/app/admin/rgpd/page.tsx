"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  Users,
  Lock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Clock,
  FileText,
  Eye,
  AlertTriangle,
  Activity,
  BarChart3,
} from "lucide-react";

interface RgpdData {
  consent: { totalUsers: number; usersWithConsent: number; usersWithHealthConsent: number; usersWithoutConsent: number; consentVersions: { version: string; count: number }[]; currentPolicyVersion: string };
  clients: { total: number; active: number; inactive: number; withConsent: number; withHealthConsent: number };
  audit: { totalLogs: number; last24h: number; recentLogs: any[]; actionBreakdown: { action: string; count: number }[]; loginAttempts: number; failedLogins: number };
  incidents: { total: number; open: number; critical: number; recent: { id: string; title: string; severity: string; status: string; category: string; createdAt: string }[] };
  dataRetention: { lastCleanup: string | null; lastCleanupDetails: any };
  invites: { pending: number; expired: number };
  compliance: Record<string, boolean>;
  complianceScore: { score: number; total: number; percent: number };
}

const complianceLabels: Record<string, string> = {
  consentManagement: "Gestão de Consentimento",
  healthDataConsent: "Consentimento Dados de Saúde",
  auditLogging: "Registo de Auditoria",
  dataRetentionPolicy: "Política de Retenção de Dados",
  incidentManagement: "Gestão de Incidentes",
  dataIsolation: "Isolamento de Dados (Multi-tenant)",
  encryptionAtRest: "Encriptação em Repouso",
  encryptionInTransit: "Encriptação em Trânsito (HTTPS)",
  rightToErasure: "Direito ao Apagamento",
  dataMinimization: "Minimização de Dados",
  privacyPolicy: "Política de Privacidade",
  cookiePolicy: "Política de Cookies",
  dpia: "DPIA (Avaliação de Impacto)",
  dpa: "DPA (Acordo de Processamento)",
};

export default function RgpdPage() {
  const [data, setData] = useState<RgpdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tab, setTab] = useState<"compliance" | "consent" | "audit">("compliance");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/rgpd");
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20"><p className="text-gray-500 dark:text-gray-400">Erro ao carregar dados RGPD.</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-500" />
            Conformidade RGPD
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Proteção de dados e conformidade regulatória</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-gray-600">{lastUpdated.toLocaleTimeString("pt-PT")}</span>}
          <button onClick={() => { setLoading(true); fetchData(); }} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <RefreshCcw className="w-3.5 h-3.5" /> Atualizar
          </button>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className={`w-8 h-8 ${data.complianceScore.percent === 100 ? "text-emerald-500" : data.complianceScore.percent >= 80 ? "text-yellow-500" : "text-red-500"}`} />
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Score de Conformidade</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{data.complianceScore.score} de {data.complianceScore.total} requisitos cumpridos</p>
            </div>
          </div>
          <div className={`text-4xl font-bold ${data.complianceScore.percent === 100 ? "text-emerald-400" : data.complianceScore.percent >= 80 ? "text-yellow-400" : "text-red-400"}`}>
            {data.complianceScore.percent}%
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${data.complianceScore.percent === 100 ? "bg-emerald-500" : data.complianceScore.percent >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
            style={{ width: `${data.complianceScore.percent}%` }}
          />
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
        {[
          { id: "compliance" as const, label: "Checklist", icon: ShieldCheck },
          { id: "consent" as const, label: "Consentimento", icon: Users },
          { id: "audit" as const, label: "Auditoria", icon: FileText },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium flex-1 justify-center transition-all ${
              tab === t.id ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-300"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Compliance Checklist */}
      {tab === "compliance" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Requisitos RGPD
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(data.compliance).map(([key, ok]) => (
                <div key={key} className={`flex items-center gap-2.5 px-4 py-3 rounded-lg ${ok ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-red-500/5 border border-red-500/10"}`}>
                  {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                  <span className={`text-xs font-medium ${ok ? "text-emerald-400" : "text-red-400"}`}>
                    {complianceLabels[key] || key}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Retenção de Dados
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Última limpeza automática</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {data.dataRetention.lastCleanup ? new Date(data.dataRetention.lastCleanup).toLocaleString("pt-PT") : "Nunca executado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Convites pendentes</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">{data.invites.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Convites expirados</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">{data.invites.expired}</span>
              </div>
            </div>
          </div>

          {/* Incidents Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Incidentes de Segurança
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className={`text-2xl font-bold ${data.incidents.open > 0 ? "text-orange-400" : "text-gray-500 dark:text-gray-400"}`}>{data.incidents.open}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Abertos</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${data.incidents.critical > 0 ? "text-red-400" : "text-gray-500 dark:text-gray-400"}`}>{data.incidents.critical}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Críticos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{data.incidents.total}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consent Tab */}
      {tab === "consent" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-blue-500" /> Utilizadores
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { label: "Total", value: data.consent.totalUsers, color: "text-gray-900 dark:text-white" },
                  { label: "Com consentimento", value: data.consent.usersWithConsent, color: "text-emerald-400" },
                  { label: "Sem consentimento", value: data.consent.usersWithoutConsent, color: data.consent.usersWithoutConsent > 0 ? "text-red-400" : "text-gray-500 dark:text-gray-400" },
                  { label: "Dados de saúde", value: data.consent.usersWithHealthConsent, color: "text-blue-400" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{r.label}</span>
                    <span className={`font-medium ${r.color}`}>{r.value}</span>
                  </div>
                ))}

                {data.consent.totalUsers > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mt-1">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.round((data.consent.usersWithConsent / data.consent.totalUsers) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-right">{Math.round((data.consent.usersWithConsent / data.consent.totalUsers) * 100)}% com consentimento</p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">Versão atual da política</span>
                  <p className="text-xs font-medium text-gray-900 dark:text-white mt-0.5">v{data.consent.currentPolicyVersion}</p>
                </div>

                {data.consent.consentVersions.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">Versões aceites</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {data.consent.consentVersions.map((v) => (
                        <span key={v.version} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
                          v{v.version}: {v.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Clients */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-emerald-500" /> Clientes
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { label: "Total", value: data.clients.total, color: "text-gray-900 dark:text-white" },
                  { label: "Ativos", value: data.clients.active, color: "text-emerald-400" },
                  { label: "Inativos", value: data.clients.inactive, color: "text-gray-500 dark:text-gray-400" },
                  { label: "Com consentimento", value: data.clients.withConsent, color: "text-emerald-400" },
                  { label: "Dados de saúde autorizados", value: data.clients.withHealthConsent, color: "text-blue-400" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{r.label}</span>
                    <span className={`font-medium ${r.color}`}>{r.value}</span>
                  </div>
                ))}

                {data.clients.total > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mt-1">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.round((data.clients.withConsent / data.clients.total) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-right">{Math.round((data.clients.withConsent / data.clients.total) * 100)}% com consentimento</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {tab === "audit" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: "Total Registos", value: data.audit.totalLogs.toLocaleString(), color: "text-blue-400" },
              { icon: Activity, label: "Últimas 24h", value: data.audit.last24h.toString(), color: "text-emerald-400" },
              { icon: Eye, label: "Logins (7d)", value: data.audit.loginAttempts.toString(), color: "text-cyan-400" },
              { icon: AlertTriangle, label: "Falhados (7d)", value: data.audit.failedLogins.toString(), color: data.audit.failedLogins > 10 ? "text-red-400" : "text-emerald-400" },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Actions Breakdown */}
          {data.audit.actionBreakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-blue-500" /> Ações (últimos 30 dias)
              </h3>
              <div className="space-y-2">
                {data.audit.actionBreakdown.map((a) => {
                  const maxCount = data.audit.actionBreakdown[0]?.count || 1;
                  return (
                    <div key={a.action} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-36 truncate">{a.action}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-500/60 h-2 rounded-full transition-all" style={{ width: `${(a.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-12 text-right">{a.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Logs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Registos Recentes
            </h3>
            {data.audit.recentLogs.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">Sem registos</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Ação</th>
                      <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Entidade</th>
                      <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Utilizador</th>
                      <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">IP</th>
                      <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.audit.recentLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100/30 dark:hover:bg-gray-800/30">
                        <td className="py-2 px-2">
                          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-yellow-400">{log.action}</span>
                        </td>
                        <td className="py-2 px-2 text-gray-500 dark:text-gray-400">{log.entity || "—"}</td>
                        <td className="py-2 px-2 text-gray-500 dark:text-gray-400 max-w-[120px] truncate">{log.userEmail || "—"}</td>
                        <td className="py-2 px-2 font-mono text-gray-600">{log.ip || "—"}</td>
                        <td className="py-2 px-2 text-right text-gray-500 dark:text-gray-400">
                          {new Date(log.createdAt).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Login Security */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-cyan-500" /> Segurança de Login (7 dias)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.audit.loginAttempts}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Tentativas</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${data.audit.failedLogins > 10 ? "text-red-400" : "text-gray-600 dark:text-gray-300"}`}>{data.audit.failedLogins}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Falhados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {data.audit.loginAttempts > 0 ? Math.round(((data.audit.loginAttempts - data.audit.failedLogins) / data.audit.loginAttempts) * 100) : 100}%
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Taxa Sucesso</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
