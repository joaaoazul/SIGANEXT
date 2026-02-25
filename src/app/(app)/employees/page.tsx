"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Search, Pencil, Trash2, Shield, Mail, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

interface Employee {
  id: string; name: string; email: string;
  phone: string | null; permissions: string | null;
  createdAt: string;
}

const PERMISSION_OPTIONS = [
  { key: "clients", label: "Clientes" },
  { key: "exercises", label: "Exercícios" },
  { key: "training", label: "Planos Treino" },
  { key: "nutrition", label: "Planos Nutrição" },
  { key: "foods", label: "Alimentos" },
  { key: "feedback", label: "Feedback" },
  { key: "bookings", label: "Agenda" },
  { key: "content", label: "Conteúdos" },
  { key: "notifications", label: "Notificações" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", permissions: [] as string[],
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/employees?${params}`);
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "", phone: "", permissions: [] });
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    let perms: string[] = [];
    try { perms = emp.permissions ? JSON.parse(emp.permissions) : []; } catch { /* empty */ }
    setForm({
      name: emp.name, email: emp.email, password: "", phone: emp.phone || "",
      permissions: perms,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/employees/${editing.id}` : "/api/employees";
    const method = editing ? "PUT" : "POST";
    const payload: Record<string, unknown> = {
      name: form.name, email: form.email, phone: form.phone,
      permissions: form.permissions,
    };
    if (form.password) payload.password = form.password;
    if (!editing && !form.password) return;
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowModal(false);
      fetchEmployees();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este funcionário?")) return;
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    fetchEmployees();
  };

  const togglePerm = (key: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const parsePerms = (permsStr: string | null): string[] => {
    try { return permsStr ? JSON.parse(permsStr) : []; } catch { return []; }
  };

  return (
    <div>
      <PageHeader
        title="Funcionários"
        description={`${employees.length} funcionário(s)`}
        action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Novo Funcionário</button>}
      />

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="Sem funcionários"
          description="Adicione funcionários para ajudar a gerir o seu negócio."
          action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Novo Funcionário</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {employees.map((emp) => {
            const perms = parsePerms(emp.permissions);
            return (
              <div key={emp.id} className="card hover:bg-gray-50 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-bold">
                      {emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{emp.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" /> {emp.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(emp)} className="p-1.5 hover:bg-white rounded-lg">
                      <Pencil className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
                {emp.phone && (
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {emp.phone}
                  </p>
                )}
                <div className="flex items-center gap-1 mb-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">Permissões:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {perms.length > 0 ? perms.map(p => {
                    const opt = PERMISSION_OPTIONS.find(o => o.key === p);
                    return <span key={p} className="badge bg-emerald-50 text-emerald-600 text-xs">{opt?.label || p}</span>;
                  }) : (
                    <span className="text-xs text-gray-500 italic">Sem permissões</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Criado: {new Date(emp.createdAt).toLocaleDateString("pt-PT")}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Editar Funcionário" : "Novo Funcionário"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password {editing ? "(deixar vazio para manter)" : "*"}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Permissões</label>
            <div className="grid grid-cols-3 gap-2">
              {PERMISSION_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(opt.key)}
                    onChange={() => togglePerm(opt.key)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs text-gray-600">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editing ? "Guardar" : "Criar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
