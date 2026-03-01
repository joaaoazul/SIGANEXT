"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Search,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
} from "lucide-react";

interface IncidentNote {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  reportedBy: string | null;
  assignedTo: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  notes: IncidentNote[];
  _count?: { notes: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SEVERITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["open", "investigating", "resolved", "closed"];
const CATEGORIES = ["bug", "security", "performance", "data", "billing", "other"];

const severityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-400",
  investigating: "bg-yellow-500/10 text-yellow-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
  closed: "bg-gray-500/10 text-gray-500",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  open: AlertTriangle,
  investigating: Search,
  resolved: CheckCircle2,
  closed: Clock,
};

const categoryLabels: Record<string, string> = {
  bug: "Bug",
  security: "Segurança",
  performance: "Performance",
  data: "Dados",
  billing: "Faturação",
  other: "Outro",
};

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Detail view
  const [selected, setSelected] = useState<Incident | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create / Edit
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "other",
    reportedBy: "",
  });
  const [saving, setSaving] = useState(false);

  // Update fields
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateResolution, setUpdateResolution] = useState("");
  const [newNote, setNewNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (severityFilter) params.set("severity", severityFilter);
    if (categoryFilter) params.set("category", categoryFilter);

    try {
      const res = await fetch(`/api/admin/incidents?${params}`);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter, categoryFilter]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
        setUpdateStatus(data.status);
        setUpdateResolution(data.resolution || "");
        setNewNote("");
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ title: "", description: "", severity: "medium", category: "other", reportedBy: "" });
        fetchIncidents();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/incidents/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updateStatus,
          resolution: updateResolution || undefined,
          note: newNote || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelected(updated);
        setNewNote("");
        fetchIncidents();
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este incidente permanentemente?")) return;
    await fetch(`/api/admin/incidents/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    fetchIncidents();
  };

  // Detail view
  if (selected) {
    const StatusIcon = statusIcons[selected.status] || AlertTriangle;
    return (
      <div className="space-y-6 max-w-3xl">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-gray-500 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{selected.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${severityColors[selected.severity]}`}>
                  {selected.severity}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[selected.status]}`}>
                  <StatusIcon className="w-3 h-3 inline mr-0.5" />
                  {selected.status}
                </span>
                <span className="text-[11px] text-gray-600">{categoryLabels[selected.category]}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-gray-300 whitespace-pre-wrap">{selected.description}</p>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>Reportado por: <span className="text-gray-300">{selected.reportedBy || "—"}</span></div>
            <div>Criado: <span className="text-gray-300">{new Date(selected.createdAt).toLocaleString("pt-PT")}</span></div>
            {selected.resolvedAt && (
              <div>Resolvido: <span className="text-emerald-400">{new Date(selected.resolvedAt).toLocaleString("pt-PT")}</span></div>
            )}
            {selected.resolution && (
              <div className="col-span-2">Resolução: <span className="text-gray-300">{selected.resolution}</span></div>
            )}
          </div>

          {selected.metadata && (
            <details className="text-xs">
              <summary className="text-gray-500 cursor-pointer hover:text-gray-300">Metadata</summary>
              <pre className="mt-2 p-3 bg-gray-800 rounded-lg text-gray-400 overflow-x-auto">
                {JSON.stringify(JSON.parse(selected.metadata), null, 2)}
              </pre>
            </details>
          )}
        </div>

        {/* Update status */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-yellow-400" />
            Atualizar Estado
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Estado</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Resolução</label>
              <input
                type="text"
                value={updateResolution}
                onChange={(e) => setUpdateResolution(e.target.value)}
                placeholder="Como foi resolvido..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Adicionar nota</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              placeholder="Detalhes da investigação, passos tomados..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={updatingStatus}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Send className="w-3.5 h-3.5" />
            {updatingStatus ? "A atualizar..." : "Guardar Atualização"}
          </button>
        </div>

        {/* Notes timeline */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Notas ({selected.notes.length})
          </h3>
          {selected.notes.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">Sem notas</p>
          ) : (
            <div className="space-y-3">
              {selected.notes.map((note) => (
                <div key={note.id} className="border-l-2 border-gray-700 pl-4 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-300">{note.authorName}</span>
                    <span className="text-[10px] text-gray-600">
                      {new Date(note.createdAt).toLocaleString("pt-PT")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            Gestão de Incidentes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination ? `${pagination.total} incidente(s)` : "A carregar..."}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Novo Incidente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none"
        >
          <option value="">Todos os estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none"
        >
          <option value="">Todas as severidades</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
        </select>
      </div>

      {/* Incidents list */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <AlertTriangle className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Sem incidentes registados</p>
          </div>
        ) : (
          incidents.map((inc) => {
            const StatusIcon = statusIcons[inc.status] || AlertTriangle;
            return (
              <div
                key={inc.id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition cursor-pointer"
                onClick={() => openDetail(inc.id)}
              >
                <div className="flex items-start gap-3">
                  <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    inc.status === "open" ? "text-red-400" :
                    inc.status === "investigating" ? "text-yellow-400" :
                    inc.status === "resolved" ? "text-emerald-400" : "text-gray-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-white">{inc.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${severityColors[inc.severity]}`}>
                        {inc.severity}
                      </span>
                      <span className="text-[10px] text-gray-600">{categoryLabels[inc.category]}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-600">
                      <span>{new Date(inc.createdAt).toLocaleDateString("pt-PT")}</span>
                      {inc._count && inc._count.notes > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {inc._count.notes}
                        </span>
                      )}
                      {inc.reportedBy && <span>por {inc.reportedBy}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[inc.status]}`}>
                      {inc.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetail(inc.id); }}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(inc.id); }}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
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

      {/* Create incident modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Novo Incidente</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="Descrição breve do incidente"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Descrição *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="Detalhes do incidente, passos para reproduzir..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Severidade</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2.5 focus:outline-none"
                >
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2.5 focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Reportado por</label>
              <input
                type="text"
                value={form.reportedBy}
                onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2.5 focus:outline-none"
                placeholder="Email ou nome (opcional)"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreate}
                disabled={saving || !form.title || !form.description}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
              >
                <Plus className="w-4 h-4" />
                {saving ? "A criar..." : "Criar Incidente"}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      )}
    </div>
  );
}
