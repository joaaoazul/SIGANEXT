"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ScrollText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCcw,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  ip: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionColors: Record<string, string> = {
  login: "text-emerald-400",
  logout: "text-gray-400",
  create: "text-blue-400",
  update: "text-yellow-400",
  delete: "text-red-400",
  export: "text-purple-400",
  password_change: "text-orange-400",
  create_incident: "text-red-400",
  update_incident: "text-yellow-400",
  delete_incident: "text-red-400",
  admin_update_user: "text-cyan-400",
  admin_suspend_user: "text-orange-400",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "50" });
    if (actionFilter) params.set("action", actionFilter);
    if (entityFilter) params.set("entity", entityFilter);
    if (userSearch) params.set("userId", userSearch);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    try {
      const res = await fetch(`/api/admin/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter, userSearch, fromDate, toDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-cyan-400" />
            Audit Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination ? `${pagination.total} entrada(s)` : "A carregar..."}
          </p>
        </div>
        <button
          onClick={() => { setPage(1); fetchLogs(); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-400">Filtros</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">Ação</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg text-xs text-white px-2 py-2 focus:outline-none"
            >
              <option value="">Todas</option>
              {Object.keys(actionColors).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">Entidade</label>
            <select
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg text-xs text-white px-2 py-2 focus:outline-none"
            >
              <option value="">Todas</option>
              {["User", "Client", "Incident", "TrainingPlan", "NutritionPlan"].map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">De</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg text-xs text-white px-2 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">Até</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg text-xs text-white px-2 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-600 mb-1">User ID</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setPage(1); }}
                placeholder="ID..."
                className="w-full pl-6 pr-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-600 uppercase">
                <th className="text-left px-4 py-3 font-medium w-32">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium">Ação</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Entidade</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Utilizador</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">IP</th>
                <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-600">Sem registos</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-2.5 text-gray-500 font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("pt-PT", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-medium ${actionColors[log.action] || "text-gray-300"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 hidden sm:table-cell">
                      {log.entity ? (
                        <span>
                          {log.entity}
                          {log.entityId && <span className="text-gray-600 ml-1 font-mono text-[10px]">{log.entityId.slice(0, 8)}</span>}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell">
                      <div>
                        {log.userEmail || "—"}
                        {log.userRole && (
                          <span className="text-[10px] text-gray-600 ml-1">({log.userRole})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono hidden lg:table-cell">
                      {log.ip || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 hidden xl:table-cell max-w-xs truncate">
                      {log.details ? log.details.slice(0, 60) + (log.details.length > 60 ? "…" : "") : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded detail pane */}
        {expandedId && (() => {
          const log = logs.find((l) => l.id === expandedId);
          if (!log) return null;
          return (
            <div className="border-t border-gray-800 p-4 bg-gray-800/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-3">
                <div>
                  <span className="text-gray-600">Ação:</span>
                  <span className={`ml-1 font-medium ${actionColors[log.action] || "text-gray-300"}`}>{log.action}</span>
                </div>
                <div>
                  <span className="text-gray-600">User ID:</span>
                  <span className="ml-1 text-gray-400 font-mono">{log.userId || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-600">IP:</span>
                  <span className="ml-1 text-gray-400 font-mono">{log.ip || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-600">User Agent:</span>
                  <span className="ml-1 text-gray-400 truncate">{log.userAgent?.slice(0, 40) || "—"}</span>
                </div>
              </div>
              {log.details && (
                <div>
                  <span className="text-[10px] text-gray-600 uppercase">Detalhes:</span>
                  <pre className="mt-1 p-3 bg-gray-900 rounded-lg text-[11px] text-gray-400 overflow-x-auto">
                    {(() => { try { return JSON.stringify(JSON.parse(log.details), null, 2); } catch { return log.details; } })()}
                  </pre>
                </div>
              )}
            </div>
          );
        })()}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page === 1} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={pagination.page === pagination.totalPages} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
