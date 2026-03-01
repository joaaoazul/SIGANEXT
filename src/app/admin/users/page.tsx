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
  deleted_client: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  deleted_admin: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editName, setEditName] = useState("");
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

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

  const handleEdit = (u: UserRow) => {
    setEditingId(u.id);
    setEditRole(u.role);
    setEditName(u.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const res = await fetch(`/api/admin/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editRole, name: editName }),
    });
    if (res.ok) {
      setActionMsg("Utilizador atualizado!");
      setEditingId(null);
      fetchUsers();
    } else {
      setActionMsg("Erro ao atualizar.");
    }
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleSuspend = async () => {
    if (!suspendId) return;
    const res = await fetch(`/api/admin/users/${suspendId}`, { method: "DELETE" });
    if (res.ok) {
      setActionMsg("Utilizador suspenso!");
      setSuspendId(null);
      fetchUsers();
    } else {
      const data = await res.json();
      setActionMsg(data.error || "Erro.");
    }
    setTimeout(() => setActionMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          Gestão de Utilizadores
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {pagination ? `${pagination.total} utilizador(es)` : "A carregar..."}
        </p>
      </div>

      {actionMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400">
          {actionMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Pesquisar por nome ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-lg text-sm text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <option value="">Todos os roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                <th className="text-left px-4 py-3 font-medium">Utilizador</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Clientes</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Criado</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Consentimento</th>
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
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm w-full"
                        />
                      ) : (
                        <span className="text-white font-medium">{u.name}</span>
                      )}
                      <p className="text-[11px] text-gray-600 sm:hidden">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      {editingId === u.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs"
                        >
                          {["admin", "superadmin", "employee", "suspended"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${roleColors[u.role] || roleColors.suspended}`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 hidden md:table-cell">
                      {u._count.managedClients}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {u.consentDate ? (
                        <span className="text-xs text-emerald-400">
                          {new Date(u.consentDate).toLocaleDateString("pt-PT")}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === u.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={handleSaveEdit} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10">
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white" title="Editar">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {u.role !== "superadmin" && u.role !== "suspended" && !u.role.startsWith("deleted") && (
                            <button onClick={() => setSuspendId(u.id)} className="p-1.5 rounded-lg text-orange-400 hover:bg-orange-500/10" title="Suspender">
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {u.role === "suspended" && (
                            <button onClick={() => { handleEdit(u); setEditRole("admin"); }} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10" title="Reativar">
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suspend confirmation */}
      {suspendId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold">Suspender utilizador?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  O utilizador não poderá aceder à plataforma. Pode ser reativado posteriormente.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSuspendId(null)} className="px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleSuspend} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                <Shield className="w-3.5 h-3.5 inline mr-1" /> Suspender
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
