"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Link,
  Copy,
  Check,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  paymentStatus: string;
  weight: number | null;
  height: number | null;
  plan: string | null;
  createdAt: string;
  trainingPlans: { trainingPlan: { name: string } }[];
  nutritionPlans: { nutritionPlan: { name: string } }[];
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteType, setInviteType] = useState<"magic_code" | "magic_link">("magic_code");
  const [inviteResult, setInviteResult] = useState<{ code: string; magicLink?: string } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    status: "active",
    height: "",
    weight: "",
    bodyFat: "",
    plan: "",
    paymentStatus: "pending",
    notes: "",
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    
    const res = await fetch(`/api/clients?${params}`);
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editClient ? "PUT" : "POST";
    const url = editClient ? `/api/clients/${editClient.id}` : "/api/clients";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setEditClient(null);
      resetForm();
      fetchClients();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tens a certeza que queres eliminar este cliente?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    fetchClients();
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      status: "active",
      height: "",
      weight: "",
      bodyFat: "",
      plan: "",
      paymentStatus: "pending",
      notes: "",
    });
  };

  const openEdit = (client: Client) => {
    setEditClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      dateOfBirth: "",
      gender: "",
      status: client.status,
      height: client.height?.toString() || "",
      weight: client.weight?.toString() || "",
      bodyFat: "",
      plan: client.plan || "",
      paymentStatus: client.paymentStatus,
      notes: "",
    });
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, type: inviteType }),
    });
    if (res.ok) {
      const data = await res.json();
      setInviteResult({ code: data.code, magicLink: data.magicLink });
    }
    setInviteLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-600",
      inactive: "bg-gray-100 text-gray-500",
      pending: "bg-yellow-50 text-yellow-600",
    };
    const labels: Record<string, string> = {
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente",
    };
    return <span className={`badge ${classes[status] || classes.pending}`}>{labels[status] || status}</span>;
  };

  const paymentBadge = (status: string) => {
    const classes: Record<string, string> = {
      paid: "bg-emerald-50 text-emerald-600",
      pending: "bg-yellow-50 text-yellow-600",
      overdue: "bg-red-50 text-red-600",
    };
    const labels: Record<string, string> = {
      paid: "Pago",
      pending: "Pendente",
      overdue: "Em atraso",
    };
    return <span className={`badge ${classes[status] || classes.pending}`}>{labels[status] || status}</span>;
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${clients.length} cliente(s) registado(s)`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowInviteModal(true); setInviteResult(null); setInviteEmail(""); }}
              className="btn-secondary"
            >
              <Link className="w-4 h-4" />
              Convidar
            </button>
            <button
              onClick={() => { resetForm(); setEditClient(null); setShowModal(true); }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>
          </div>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-10 pr-8 appearance-none"
          >
            <option value="">Todos os estados</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="pending">Pendentes</option>
          </select>
        </div>
      </div>

      {/* Client List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="Nenhum cliente encontrado"
          description="Começa por adicionar o teu primeiro cliente à plataforma."
          action={
            <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
              <Plus className="w-4 h-4" />
              Adicionar Cliente
            </button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {/* Table header - desktop */}
          <div className="hidden lg:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <span>Cliente</span>
            <span>Contacto</span>
            <span>Plano</span>
            <span>Estado</span>
            <span>Pagamento</span>
            <span></span>
          </div>

          {clients.map((client) => (
            <div
              key={client.id}
              className="card hover:bg-gray-50 transition-colors"
            >
              <div className="lg:grid lg:grid-cols-[1fr_1fr_auto_auto_auto_auto] lg:gap-4 lg:items-center space-y-3 lg:space-y-0">
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-semibold shrink-0">
                    {client.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                    {client.weight && (
                      <p className="text-xs text-gray-400">{client.weight}kg {client.height ? `• ${client.height}cm` : ""}</p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                {/* Plan */}
                <div className="text-sm text-gray-500">
                  {client.plan || "—"}
                </div>

                {/* Status */}
                {statusBadge(client.status)}

                {/* Payment */}
                {paymentBadge(client.paymentStatus)}

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === client.id ? null : client.id)}
                    className="p-2 hover:bg-white rounded-lg transition"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>

                  {menuOpen === client.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-44">
                        <button
                          onClick={() => { router.push(`/clients/${client.id}`); setMenuOpen(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" /> Ver Detalhes
                        </button>
                        <button
                          onClick={() => openEdit(client)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" /> Editar
                        </button>
                        <button
                          onClick={() => { handleDelete(client.id); setMenuOpen(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditClient(null); resetForm(); }}
        title={editClient ? "Editar Cliente" : "Novo Cliente"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+351 912 345 678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Género</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="input-field"
              >
                <option value="">Selecionar</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Dados Físicos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="input-field"
                  placeholder="175"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="input-field"
                  placeholder="75.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">% Gordura</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.bodyFat}
                  onChange={(e) => setForm({ ...form, bodyFat: e.target.value })}
                  className="input-field"
                  placeholder="15.0"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Subscrição</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Plano</label>
                <input
                  type="text"
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Mensal, Trimestral"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Pagamento</label>
                <select
                  value={form.paymentStatus}
                  onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                  className="input-field"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Em atraso</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field min-h-[80px] resize-y"
              placeholder="Notas adicionais sobre o cliente..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowModal(false); setEditClient(null); }} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editClient ? "Guardar Alterações" : "Criar Cliente"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Convidar Atleta">
        <div className="space-y-4">
          {!inviteResult ? (
            <>
              <p className="text-sm text-gray-500">Envia um código ou link mágico para o atleta se registar.</p>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email do Atleta</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="atleta@email.com" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Tipo de Convite</label>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${inviteType === "magic_code" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" checked={inviteType === "magic_code"} onChange={() => setInviteType("magic_code")} className="text-emerald-500 focus:ring-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Código</p>
                      <p className="text-xs text-gray-500">6 dígitos</p>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${inviteType === "magic_link" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" checked={inviteType === "magic_link"} onChange={() => setInviteType("magic_link")} className="text-emerald-500 focus:ring-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Link Mágico</p>
                      <p className="text-xs text-gray-500">URL único</p>
                    </div>
                  </label>
                </div>
              </div>
              <button onClick={handleInvite} disabled={!inviteEmail || inviteLoading} className="btn-primary w-full justify-center">
                {inviteLoading ? "A criar..." : "Criar Convite"}
              </button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-2">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Convite Criado!</h3>
              {inviteResult.code && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Código de convite:</p>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center gap-3">
                    <span className="text-2xl font-bold tracking-[0.3em] text-gray-900">{inviteResult.code}</span>
                    <button onClick={() => copyToClipboard(inviteResult.code)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}
              {inviteResult.magicLink && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Link de registo:</p>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <input type="text" value={inviteResult.magicLink} readOnly className="flex-1 bg-transparent text-xs text-gray-600 border-0 p-0 focus:ring-0" />
                    <button onClick={() => copyToClipboard(inviteResult.magicLink!)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400">Válido por 7 dias. Partilha com o atleta para se registar.</p>
              <button onClick={() => setShowInviteModal(false)} className="btn-primary w-full justify-center">Fechar</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
