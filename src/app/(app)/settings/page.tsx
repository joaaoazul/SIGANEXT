"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, User, CreditCard, Shield, Save, Key, Download, Trash2, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.name) {
        setProfile({ name: data.name, email: data.email, phone: data.phone || "" });
      }
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    setMessage(res.ok ? "Perfil atualizado com sucesso!" : "Erro ao atualizar perfil");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setMessage("As passwords não coincidem");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setSaving(true);
    const res = await fetch("/api/auth/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
    });
    setSaving(false);
    setMessage(res.ok ? "Password alterada com sucesso!" : "Erro ao alterar password");
    setPasswords({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setMessage(""), 3000);
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/auth/export-data");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "dados-pessoais.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Erro ao exportar dados.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Introduza a password para confirmar.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/login");
      } else {
        setDeleteError(data.error || "Erro ao eliminar conta.");
      }
    } catch {
      setDeleteError("Erro de rede.");
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { key: "profile", label: "Perfil", icon: <User className="w-4 h-4" /> },
    { key: "security", label: "Segurança", icon: <Shield className="w-4 h-4" /> },
    { key: "privacy", label: "Privacidade", icon: <Shield className="w-4 h-4" /> },
    { key: "billing", label: "Faturação", icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div>
      <PageHeader title="Definições" description="Gerir o seu perfil e configurações" />

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes("sucesso") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      <div className="flex gap-6">
        {/* Tab nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.key ? "bg-emerald-50 text-emerald-600" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="card max-w-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" /> Perfil
              </h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" />
                </div>
                <button type="submit" disabled={saving} className="btn-primary">
                  <Save className="w-4 h-4" /> {saving ? "A guardar..." : "Guardar"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="card max-w-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" /> Alterar Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Password Atual</label>
                  <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nova Password</label>
                  <input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} className="input-field" required minLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Confirmar Nova Password</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="input-field" required />
                </div>
                <button type="submit" disabled={saving} className="btn-primary">
                  <Shield className="w-4 h-4" /> {saving ? "A alterar..." : "Alterar Password"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="card max-w-xl space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" /> Dados e Privacidade
              </h3>
              <p className="text-sm text-gray-500">
                Nos termos do RGPD, tem direito a exportar ou eliminar os seus dados pessoais.{" "}
                <a href="/privacy" className="text-emerald-600 underline hover:text-emerald-700">Política de Privacidade</a>
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleExportData} disabled={exporting} className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-medium transition">
                  <Download className="w-4 h-4" /> {exporting ? "A exportar..." : "Exportar Meus Dados"}
                </button>
                <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-medium transition">
                  <Trash2 className="w-4 h-4" /> Eliminar Conta
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="border border-red-200 bg-red-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Atenção: esta ação é irreversível</p>
                      <p className="text-xs text-red-600 mt-1">A sua conta será desativada. Introduza a password para confirmar.</p>
                    </div>
                  </div>
                  {deleteError && <p className="text-sm text-red-700 bg-red-100 rounded-lg px-3 py-2">{deleteError}</p>}
                  <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="A sua password" />
                  <div className="flex gap-2">
                    <button onClick={handleDeleteAccount} disabled={deleting} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
                      <Trash2 className="w-4 h-4" /> {deleting ? "A eliminar..." : "Confirmar Eliminação"}
                    </button>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6 max-w-2xl">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" /> Plano Atual
                </h3>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-emerald-600">SIGA180 Pro</h4>
                      <p className="text-sm text-gray-500 mt-1">Plataforma Core + Todos os Módulos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">€65<span className="text-sm text-gray-500">/mês</span></p>
                      <p className="text-xs text-gray-400">até 100 clientes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tabela de Preços</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-500 font-medium">Componente</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Preço</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Plataforma Core (até 100 clientes)</td>
                        <td className="text-right font-semibold text-gray-900">€65/mês</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Bloco adicional (+100 clientes)</td>
                        <td className="text-right font-semibold text-gray-900">+€40/mês</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-gray-400">— Gestão de Clientes</td>
                        <td className="text-right text-emerald-600">Incluído</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-gray-400">— Base de Exercícios</td>
                        <td className="text-right text-emerald-600">Incluído</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-gray-400">— Planos de Treino</td>
                        <td className="text-right text-emerald-600">Incluído</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-gray-400">— Planos de Nutrição</td>
                        <td className="text-right text-emerald-600">Incluído</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-gray-400">— Feedback e Avaliações</td>
                        <td className="text-right text-emerald-600">Incluído</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-gray-400">— Alertas e Lembretes</td>
                        <td className="text-right text-emerald-600">Incluído</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Pagamentos</td>
                        <td className="text-right font-semibold text-gray-900">+€15/mês</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Funcionários</td>
                        <td className="text-right font-semibold text-gray-900">+€10/mês</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Notificações Personalizadas</td>
                        <td className="text-right font-semibold text-gray-900">+€10/mês</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Conteúdos</td>
                        <td className="text-right font-semibold text-gray-900">+€10/mês</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Marcações / Agenda</td>
                        <td className="text-right font-semibold text-gray-900">+€15/mês</td>
                      </tr>
                      <tr>
                        <td className="py-2.5">Módulo Chat</td>
                        <td className="text-right font-semibold text-gray-900">+€15/mês</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Desenvolvimento</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-500 font-medium">Item</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Custo</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Plataforma Core</td>
                        <td className="text-right font-semibold text-gray-900">€2.000</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Pagamentos</td>
                        <td className="text-right font-semibold text-gray-900">€600</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Funcionários</td>
                        <td className="text-right font-semibold text-gray-900">€500</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Notificações</td>
                        <td className="text-right font-semibold text-gray-900">€400</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Conteúdos</td>
                        <td className="text-right font-semibold text-gray-900">€500</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Marcações / Agenda</td>
                        <td className="text-right font-semibold text-gray-900">€700</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5">Módulo Chat</td>
                        <td className="text-right font-semibold text-gray-900">€800</td>
                      </tr>
                      <tr className="border-b border-gray-200 font-bold">
                        <td className="py-2.5 text-gray-900">Total</td>
                        <td className="text-right text-emerald-600">€5.500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
