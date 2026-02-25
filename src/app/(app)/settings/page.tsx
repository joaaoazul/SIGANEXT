"use client";

import { useState, useEffect } from "react";
import { Settings, User, CreditCard, Shield, Save, Key } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  const tabs = [
    { key: "profile", label: "Perfil", icon: <User className="w-4 h-4" /> },
    { key: "security", label: "Segurança", icon: <Shield className="w-4 h-4" /> },
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
