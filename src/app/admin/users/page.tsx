"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  X,
  Save,
  AlertTriangle,
  Key,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  RefreshCw,
  Lock,
  CheckCircle,
  XCircle,
  UserCog,
  Download,
} from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  consentDate: string | null;
  _count: { managedClients: number };
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  bio: string | null;
  specialties: string | null;
  location: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  consentDate: string | null;
  consentIp: string | null;
  consentVersion: string | null;
  healthDataConsent: boolean;
  permissions: unknown;
  _count: { managedClients: number; bookingSlots: number };
  managedClients: { id: string; name: string; email: string; status: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ROLES = ["admin", "superadmin", "employee", "client", "suspended", "deleted_client", "deleted_admin"];

const roleColors: Record<string, string> = {
  superadmin: "bg-red-500/10 text-red-400 border-red-500/20",
  admin: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  employee: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  client: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  suspended: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  deleted_client: "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20",
  deleted_admin: "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20",
};

type ModalType = "detail" | "edit" | "password" | "delete" | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    specialties: "",
    location: "",
    role: "",
  });

  // Password reset state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [deletePurge, setDeletePurge] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "25" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchUserDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
        return data;
      }
    } finally {
      setLoadingDetail(false);
    }
    return null;
  };

  const openDetail = async (id: string) => {
    setSelectedUserId(id);
    setActiveModal("detail");
    await fetchUserDetail(id);
  };

  const openEdit = async (id: string) => {
    setSelectedUserId(id);
    setActiveModal("edit");
    const user = await fetchUserDetail(id);
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        specialties: user.specialties || "",
        location: user.location || "",
        role: user.role || "",
      });
    }
  };

  const openPasswordReset = (id: string) => {
    setSelectedUserId(id);
    setActiveModal("password");
    setNewPassword("");
    setConfirmPassword("");
  };

  const openDelete = (id: string) => {
    setSelectedUserId(id);
    setActiveModal("delete");
    setDeleteConfirm("");
    setDeletePermanent(false);
    setDeletePurge(false);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    setSelectedUserId(null);
    setNewPassword("");
    setConfirmPassword("");
    setDeleteConfirm("");
    setDeletePermanent(false);
    setDeletePurge(false);
    setEditForm({ name: "", email: "", phone: "", bio: "", specialties: "", location: "", role: "" });
  };

  // ---- Actions ----

  const handleSaveEdit = async () => {
    if (!selectedUserId) return;
    setActionLoading(true);
    try {
      const body: Record<string, unknown> = {};
      if (editForm.name) body.name = editForm.name;
      if (editForm.email) body.email = editForm.email;
      body.phone = editForm.phone || null;
      body.bio = editForm.bio || null;
      body.specialties = editForm.specialties || null;
      body.location = editForm.location || null;
      if (editForm.role) body.role = editForm.role;

      const res = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        showMsg("Utilizador atualizado com sucesso!");
        closeModal();
        fetchUsers();
      } else {
        const data = await res.json();
        showMsg(data.error || "Erro ao atualizar.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUserId) return;
    if (newPassword.length < 6) {
      showMsg("Password deve ter pelo menos 6 caracteres.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showMsg("As passwords não coincidem.", "error");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        showMsg("Password redefinida com sucesso!");
        closeModal();
      } else {
        const data = await res.json();
        showMsg(data.error || "Erro ao redefinir password.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        showMsg("Utilizador suspenso!");
        closeModal();
        fetchUsers();
      } else {
        const data = await res.json();
        showMsg(data.error || "Erro ao suspender.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (id: string, currentRole?: string) => {
    const restoreRole = currentRole === "suspended" ? "employee" : currentRole || "employee";
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: restoreRole }),
      });
      if (res.ok) {
        showMsg("Conta reativada com sucesso!");
        closeModal();
        fetchUsers();
      } else {
        showMsg("Erro ao reativar.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetConsent = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetConsent: true }),
      });
      if (res.ok) {
        showMsg("Consentimento RGPD reiniciado!");
        if (activeModal === "detail") await fetchUserDetail(id);
      } else {
        showMsg("Erro ao reiniciar consentimento.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;
    const targetUser = users.find(u => u.id === selectedUserId);
    if (deletePermanent && deleteConfirm !== targetUser?.email) {
      showMsg("Email de confirmação não corresponde.", "error");
      return;
    }
    setActionLoading(true);
    try {
      const params = new URLSearchParams();
      if (deletePermanent) params.set("permanent", "true");
      if (deletePurge) params.set("purge", "true");

      const res = await fetch(`/api/admin/users/${selectedUserId}?${params}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        showMsg(data.action === "deleted" ? "Utilizador eliminado permanentemente!" : "Utilizador suspenso!");
        closeModal();
        fetchUsers();
      } else {
        const data = await res.json();
        showMsg(data.error || "Erro ao eliminar.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const exportUsersCSV = () => {
    const headers = ["Nome", "Email", "Role", "Telefone", "Criado", "Clientes"];
    const rows = users.map(u => [
      u.name, u.email, u.role, u.phone || "",
      new Date(u.createdAt).toLocaleDateString("pt-PT"),
      u._count.managedClients.toString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `utilizadores_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          Gestão de Utilizadores
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Administração IT — gestão de contas, passwords, dados e permissões
        </p>
        {pagination && (
          <p className="text-gray-600 text-xs mt-0.5">{pagination.total} utilizador(es) registados</p>
        )}
      </div>
        <button onClick={exportUsersCSV} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <Download className="w-3.5 h-3.5" /> Exportar CSV
        </button>
      </div>

      {actionMsg && (
        <div className={`rounded-lg p-3 text-sm border ${
          actionMsg.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {actionMsg.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Pesquisar por nome ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <option value="">Todos os roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase">
                <th className="text-left px-4 py-3 font-medium">Utilizador</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Clientes</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Criado</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">RGPD</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-600">Sem resultados</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100/30 dark:hover:bg-gray-800/30 cursor-pointer" onClick={() => openDetail(u.id)}>
                    <td className="px-4 py-3">
                      <span className="text-gray-900 dark:text-white font-medium">{u.name}</span>
                      <p className="text-[11px] text-gray-600 sm:hidden">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${roleColors[u.role] || roleColors.suspended}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {u._count.managedClients}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {u.consentDate ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => openDetail(u.id)} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white" title="Ver detalhes">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(u.id)} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white" title="Editar">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openPasswordReset(u.id)} className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-500/10" title="Reset password">
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== "superadmin" && u.role !== "suspended" && !u.role.startsWith("deleted") && (
                          <button onClick={() => handleSuspend(u.id)} className="p-1.5 rounded-lg text-orange-400 hover:bg-orange-500/10" title="Suspender">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {u.role === "suspended" && (
                          <button onClick={() => handleReactivate(u.id)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10" title="Reativar conta">
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {u.role !== "superadmin" && (
                          <button onClick={() => openDelete(u.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10" title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== DETAIL MODAL ===== */}
      {activeModal === "detail" && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                <UserCog className="w-5 h-5 text-blue-400" />
                Detalhes do Utilizador
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail && !selectedUser ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto" />
              </div>
            ) : selectedUser ? (
              <div className="p-5 space-y-5">
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField icon={<Users className="w-4 h-4" />} label="Nome" value={selectedUser.name} />
                  <InfoField icon={<Mail className="w-4 h-4" />} label="Email" value={selectedUser.email} />
                  <InfoField icon={<Phone className="w-4 h-4" />} label="Telefone" value={selectedUser.phone || "—"} />
                  <InfoField icon={<MapPin className="w-4 h-4" />} label="Localização" value={selectedUser.location || "—"} />
                  <InfoField icon={<Shield className="w-4 h-4" />} label="Role" value={selectedUser.role} badge badgeColor={roleColors[selectedUser.role]} />
                  <InfoField icon={<Calendar className="w-4 h-4" />} label="Registado" value={new Date(selectedUser.createdAt).toLocaleString("pt-PT")} />
                </div>

                {/* Bio & Specialties */}
                {(selectedUser.bio || selectedUser.specialties) && (
                  <div className="space-y-3">
                    {selectedUser.bio && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Bio</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedUser.bio}</p>
                      </div>
                    )}
                    {selectedUser.specialties && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Especialidades</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{selectedUser.specialties}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* RGPD Consent */}
                <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Consentimento RGPD
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Data</span>
                      <p className="text-gray-600 dark:text-gray-300">{selectedUser.consentDate ? new Date(selectedUser.consentDate).toLocaleString("pt-PT") : "Não dado"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">IP</span>
                      <p className="text-gray-600 dark:text-gray-300 font-mono text-xs">{selectedUser.consentIp || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Versão</span>
                      <p className="text-gray-600 dark:text-gray-300">{selectedUser.consentVersion || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Dados de Saúde</span>
                      <p className={selectedUser.healthDataConsent ? "text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
                        {selectedUser.healthDataConsent ? "Autorizado" : "Não autorizado"}
                      </p>
                    </div>
                  </div>
                  {selectedUser.consentDate && (
                    <button
                      onClick={() => handleResetConsent(selectedUser.id)}
                      disabled={actionLoading}
                      className="mt-2 text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" /> Reiniciar consentimento
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser._count.managedClients}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clientes geridos</p>
                  </div>
                  <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser._count.bookingSlots}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Slots de booking</p>
                  </div>
                </div>

                {/* Managed Clients list */}
                {selectedUser.managedClients.length > 0 && (
                  <div>
                    <h4 className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-2">Clientes ({selectedUser.managedClients.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedUser.managedClients.map((c) => (
                        <div key={c.id} className="flex items-center justify-between bg-gray-100/30 dark:bg-gray-800/30 rounded-lg px-3 py-2">
                          <div>
                            <span className="text-sm text-gray-900 dark:text-white">{c.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{c.email}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                            c.status === "active" ? "text-emerald-400 border-emerald-500/20" : "text-gray-500 dark:text-gray-400 border-gray-600"
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button onClick={() => { closeModal(); openEdit(selectedUser.id); }} className="px-3 py-2 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 flex items-center gap-1.5">
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <button onClick={() => { closeModal(); openPasswordReset(selectedUser.id); }} className="px-3 py-2 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 flex items-center gap-1.5">
                    <Key className="w-3 h-3" /> Reset Password
                  </button>
                  {selectedUser.role === "suspended" && (
                    <button onClick={() => handleReactivate(selectedUser.id)} disabled={actionLoading} className="px-3 py-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50">
                      <UserCheck className="w-3 h-3" /> Reativar Conta
                    </button>
                  )}
                  {selectedUser.role !== "superadmin" && selectedUser.role !== "suspended" && (
                    <button onClick={() => handleSuspend(selectedUser.id)} disabled={actionLoading} className="px-3 py-2 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 flex items-center gap-1.5 disabled:opacity-50">
                      <UserX className="w-3 h-3" /> Suspender
                    </button>
                  )}
                  {selectedUser.role !== "superadmin" && (
                    <button onClick={() => { closeModal(); openDelete(selectedUser.id); }} className="px-3 py-2 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 flex items-center gap-1.5">
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {activeModal === "edit" && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Editar Utilizador
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto" />
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <FormField label="Nome" value={editForm.name} onChange={(v) => setEditForm(f => ({ ...f, name: v }))} />
                <FormField label="Email" value={editForm.email} onChange={(v) => setEditForm(f => ({ ...f, email: v }))} type="email" />
                <FormField label="Telefone" value={editForm.phone} onChange={(v) => setEditForm(f => ({ ...f, phone: v }))} />
                <FormField label="Bio" value={editForm.bio} onChange={(v) => setEditForm(f => ({ ...f, bio: v }))} textarea />
                <FormField label="Especialidades" value={editForm.specialties} onChange={(v) => setEditForm(f => ({ ...f, specialties: v }))} />
                <FormField label="Localização" value={editForm.location} onChange={(v) => setEditForm(f => ({ ...f, location: v }))} />
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1.5">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    {["admin", "superadmin", "employee", "client", "suspended"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    Cancelar
                  </button>
                  <button onClick={handleSaveEdit} disabled={actionLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PASSWORD RESET MODAL ===== */}
      {activeModal === "password" && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-400" />
                Reset de Password
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define uma nova password para o utilizador. O utilizador será notificado que a password foi alterada.
              </p>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1.5">Nova Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1.5">Confirmar Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetir password"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">As passwords não coincidem</p>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-200 dark:border-gray-800">
                <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  Cancelar
                </button>
                <button
                  onClick={handlePasswordReset}
                  disabled={actionLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" /> Redefinir Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE MODAL ===== */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Eliminar Utilizador
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-300">Esta ação é sensível. Escolha o tipo de eliminação:</p>
              </div>

              {/* Suspend only */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100/30 dark:hover:bg-gray-800/30">
                <input
                  type="radio"
                  name="deleteType"
                  checked={!deletePermanent}
                  onChange={() => { setDeletePermanent(false); setDeletePurge(false); setDeleteConfirm(""); }}
                  className="mt-1 accent-orange-500"
                />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">Suspender conta</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bloqueia o acesso mas mantém todos os dados. Pode ser reativada.</p>
                </div>
              </label>

              {/* Permanent delete */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-red-500/20 cursor-pointer hover:bg-red-500/5">
                <input
                  type="radio"
                  name="deleteType"
                  checked={deletePermanent}
                  onChange={() => setDeletePermanent(true)}
                  className="mt-1 accent-red-500"
                />
                <div>
                  <p className="text-sm text-red-400 font-medium">Eliminar permanentemente</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Remove a conta do sistema. Esta ação é irreversível.</p>
                </div>
              </label>

              {/* Purge option (only if permanent) */}
              {deletePermanent && (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-red-500/10 bg-red-500/5 cursor-pointer ml-6">
                  <input
                    type="checkbox"
                    checked={deletePurge}
                    onChange={(e) => setDeletePurge(e.target.checked)}
                    className="accent-red-500"
                  />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Purgar todos os dados associados</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Elimina alimentos, exercícios, conteúdos, slots de booking, notificações e feedbacks criados por este utilizador.</p>
                  </div>
                </label>
              )}

              {/* Confirmation for permanent delete */}
              {deletePermanent && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">
                    Escreva o email do utilizador para confirmar: <span className="text-red-400 font-mono">{users.find(u => u.id === selectedUserId)?.email}</span>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="email@exemplo.pt"
                    className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-200 dark:border-gray-800">
                <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading || (deletePermanent && deleteConfirm !== users.find(u => u.id === selectedUserId)?.email)}
                  className={`px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 ${
                    deletePermanent ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {deletePermanent ? <Trash2 className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                  {deletePermanent ? "Eliminar permanentemente" : "Suspender"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Helper components ----

function InfoField({ icon, label, value, badge, badgeColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-500 dark:text-gray-400 mt-0.5">{icon}</span>
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{label}</span>
        {badge ? (
          <span className={`block text-[11px] font-medium px-2 py-0.5 rounded-full border mt-0.5 w-fit ${badgeColor || ""}`}>
            {value}
          </span>
        ) : (
          <p className="text-sm text-gray-200">{value}</p>
        )}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", textarea }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium block mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        />
      )}
    </div>
  );
}
