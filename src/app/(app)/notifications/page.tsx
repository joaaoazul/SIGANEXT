"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Plus, Check, CheckCheck, Trash2, Filter, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

interface Notification {
  id: string; title: string; message: string;
  type: string; isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "info" });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "unread") params.set("read", "false");
    if (filter === "read") params.set("read", "true");
    if (["info", "warning", "success", "error"].includes(filter)) params.set("type", filter);
    const res = await fetch(`/api/notifications?${params}`);
    const data = await res.json();
    setNotifications(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ title: "", message: "", type: "info" });
      fetchNotifications();
    }
  };

  const toggleRead = async (id: string, currentRead: boolean) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !currentRead }),
    });
    fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PUT" });
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    fetchNotifications();
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "success": return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "error": return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notificações"
        description={`${unreadCount} não lida(s)`}
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn-secondary">
                <CheckCheck className="w-4 h-4" /> Marcar todas lidas
              </button>
            )}
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Nova
            </button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="relative w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field pl-10 appearance-none">
            <option value="">Todas</option>
            <option value="unread">Não lidas</option>
            <option value="read">Lidas</option>
            <option value="info">Info</option>
            <option value="warning">Aviso</option>
            <option value="success">Sucesso</option>
            <option value="error">Erro</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="Sem notificações"
          description="Não há notificações para mostrar."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start gap-3 transition-colors ${
                !n.isRead ? "bg-white/[0.06] border-l-2 border-l-emerald-500" : "opacity-70"
              }`}
            >
              <div className="shrink-0 mt-0.5">{typeIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className={`text-sm font-medium ${!n.isRead ? "text-gray-900" : "text-gray-500"}`}>{n.title}</h4>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleDateString("pt-PT")} às {new Date(n.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => toggleRead(n.id, n.isRead)} className="p-1.5 hover:bg-white rounded-lg" title={n.isRead ? "Marcar não lida" : "Marcar lida"}>
                  <Check className={`w-4 h-4 ${n.isRead ? "text-gray-500" : "text-emerald-600"}`} />
                </button>
                <button onClick={() => handleDelete(n.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Notificação">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              <option value="info">Info</option>
              <option value="warning">Aviso</option>
              <option value="success">Sucesso</option>
              <option value="error">Erro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Mensagem *</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field min-h-[80px]" required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Criar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
