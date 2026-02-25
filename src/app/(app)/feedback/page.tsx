"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Plus, Filter, Star, Send, Eye, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

interface Feedback {
  id: string;
  type: string;
  subject: string;
  message: string;
  rating: number | null;
  status: string;
  response: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string };
}

interface Client { id: string; name: string; email: string; }

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const [form, setForm] = useState({
    clientId: "", type: "general", subject: "", message: "", rating: "",
  });

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/feedback?${params}`);
    const data = await res.json();
    setFeedbacks(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [statusFilter]);

  const fetchClients = useCallback(async () => {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { fetchFeedbacks(); fetchClients(); }, [fetchFeedbacks, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ clientId: "", type: "general", subject: "", message: "", rating: "" });
      fetchFeedbacks();
    }
  };

  const handleRespond = async (id: string) => {
    await fetch(`/api/feedback/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reviewed", response: responseText }),
    });
    setShowDetail(null);
    setResponseText("");
    fetchFeedbacks();
  };

  const handleResolve = async (id: string) => {
    await fetch(`/api/feedback/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    fetchFeedbacks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este feedback?")) return;
    await fetch(`/api/feedback/${id}`, { method: "DELETE" });
    fetchFeedbacks();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { class: string; label: string }> = {
      pending: { class: "bg-yellow-50 text-yellow-600", label: "Pendente" },
      reviewed: { class: "bg-blue-50 text-blue-600", label: "Analisado" },
      resolved: { class: "bg-emerald-50 text-emerald-600", label: "Resolvido" },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  const typeLabels: Record<string, string> = {
    general: "Geral", training: "Treino", nutrition: "Nutrição", progress: "Progresso",
  };

  return (
    <div>
      <PageHeader
        title="Feedbacks"
        description={`${feedbacks.length} feedback(s)`}
        action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Enviar Feedback</button>}
      />

      <div className="mb-6">
        <div className="relative w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field pl-10 appearance-none">
            <option value="">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="reviewed">Analisados</option>
            <option value="resolved">Resolvidos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : feedbacks.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8" />}
          title="Nenhum feedback"
          description="Ainda não há feedbacks registados."
          action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Enviar Feedback</button>}
        />
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="card hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{fb.subject}</h3>
                    {statusBadge(fb.status)}
                    <span className="badge bg-gray-100 text-gray-500">{typeLabels[fb.type] || fb.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {fb.client.name} • {new Date(fb.createdAt).toLocaleDateString("pt-PT")}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">{fb.message}</p>
                  {fb.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.rating! ? "text-yellow-600 fill-yellow-400" : "text-gray-500"}`} />
                      ))}
                    </div>
                  )}
                  {fb.response && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Resposta:</p>
                      <p className="text-sm text-gray-600">{fb.response}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setShowDetail(fb); setResponseText(fb.response || ""); }} className="p-2 hover:bg-white rounded-lg">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  {fb.status !== "resolved" && (
                    <button onClick={() => handleResolve(fb.id)} className="p-2 hover:bg-emerald-50 rounded-lg" title="Marcar como resolvido">
                      <Send className="w-4 h-4 text-emerald-600" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(fb.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send feedback */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Enviar Feedback">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cliente *</label>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="input-field" required>
              <option value="">Selecionar</option>
              {clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="general">Geral</option>
                <option value="training">Treino</option>
                <option value="nutrition">Nutrição</option>
                <option value="progress">Progresso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="input-field">
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map(n => (<option key={n} value={n}>{n} estrela(s)</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Assunto *</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Mensagem *</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field min-h-[100px]" required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Enviar</button>
          </div>
        </form>
      </Modal>

      {/* Detail & respond */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Detalhes do Feedback" size="lg">
        {showDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Cliente:</span> <span className="text-gray-900 ml-2">{showDetail.client.name}</span></div>
              <div><span className="text-gray-400">Tipo:</span> <span className="text-gray-900 ml-2">{typeLabels[showDetail.type]}</span></div>
              <div><span className="text-gray-400">Estado:</span> <span className="ml-2">{statusBadge(showDetail.status)}</span></div>
              <div><span className="text-gray-400">Data:</span> <span className="text-gray-900 ml-2">{new Date(showDetail.createdAt).toLocaleDateString("pt-PT")}</span></div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Mensagem:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{showDetail.message}</p>
            </div>
            {showDetail.status !== "resolved" && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Resposta</label>
                <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} className="input-field min-h-[80px]" placeholder="Escreve a tua resposta..." />
                <div className="flex justify-end gap-3 mt-3">
                  <button onClick={() => handleRespond(showDetail.id)} className="btn-primary">
                    <Send className="w-4 h-4" /> Responder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
