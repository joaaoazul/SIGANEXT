"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, CreditCard, Shield, Save, Key, Download, Trash2, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // ─── ESTADO DE FATURAÇÃO SAAS ───
  const [billing, setBilling] = useState({ plan: "starter", activeClients: 0 });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showWithdrawConsent, setShowWithdrawConsent] = useState(false);
  const [withdrawConfirmation, setWithdrawConfirmation] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.name) {
        setProfile({ name: data.name, email: data.email, phone: data.phone || "" });
        // Recebe o plano atual e quantos clientes ativos o PT tem
        setBilling({ plan: data.plan || "starter", activeClients: data.activeClientsCount || 0 });
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
    { key: "billing", label: "Subscrição", icon: <CreditCard className="w-4 h-4" /> },
  ];

  // ─── LÓGICA DOS PLANOS ───
  const planLimits: Record<string, { label: string, max: number, price: string }> = {
    "starter": { label: "Plano Arranque", max: 15, price: "39€" },
    "pro": { label: "Plano Escala", max: 50, price: "79€" },
    "elite": { label: "Plano Ilimitado", max: 99999, price: "129€" },
  };

  const currentPlanDetails = planLimits[billing.plan] || planLimits["starter"];
  const usagePercentage = Math.min((billing.activeClients / currentPlanDetails.max) * 100, 100);

  return (
    <div>
      <PageHeader title="Definições" description="Gerir o seu perfil e configurações da conta" />

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes("sucesso") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Menu Lateral das Abas */}
        <div className="w-full md:w-48 shrink-0">
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

        {/* Conteúdo das Abas */}
        <div className="flex-1">
          
          {/* ABA: PERFIL */}
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
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input-field" disabled />
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

          {/* ABA: SEGURANÇA */}
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

          {/* ABA: PRIVACIDADE (EXATAMENTE COMO ESTAVA ANTES) */}
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

              {/* Consent Withdrawal */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Revogar Consentimento</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Nos termos do Art. 7.º, n.º 3 do RGPD, pode revogar o seu consentimento a qualquer momento.
                  A sua conta será suspensa mas os dados mantidos pelo período de retenção legal (2 anos).
                </p>
                <button onClick={() => setShowWithdrawConsent(!showWithdrawConsent)} className="text-sm text-amber-600 hover:text-amber-700 font-medium underline transition">
                  Revogar consentimento RGPD
                </button>
              </div>

              {showWithdrawConsent && (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Revogar Consentimento RGPD</p>
                      <p className="text-xs text-amber-700 mt-1">A sua conta será suspensa. Poderá contactar-nos para reativação. Escreva &quot;REVOGAR CONSENTIMENTO&quot; para confirmar.</p>
                    </div>
                  </div>
                  {withdrawError && <p className="text-sm text-red-700 bg-red-100 rounded-lg px-3 py-2">{withdrawError}</p>}
                  <input type="text" value={withdrawConfirmation} onChange={(e) => setWithdrawConfirmation(e.target.value)} className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="REVOGAR CONSENTIMENTO" />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setWithdrawing(true);
                        setWithdrawError("");
                        try {
                          const res = await fetch("/api/auth/withdraw-consent", {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ confirmation: withdrawConfirmation }),
                          });
                          const data = await res.json();
                          if (!res.ok) { setWithdrawError(data.error); setWithdrawing(false); return; }
                          router.push("/login");
                        } catch { setWithdrawError("Erro de ligação"); setWithdrawing(false); }
                      }}
                      disabled={withdrawing || withdrawConfirmation !== "REVOGAR CONSENTIMENTO"}
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                    >
                      {withdrawing ? "A revogar..." : "Confirmar Revogação"}
                    </button>
                    <button onClick={() => { setShowWithdrawConsent(false); setWithdrawConfirmation(""); setWithdrawError(""); }} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}  

              {/* Legal links */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 text-sm">
                <a href="/privacy" className="text-emerald-600 hover:text-emerald-700 underline">Política de Privacidade</a>
                <a href="/cookies" className="text-emerald-600 hover:text-emerald-700 underline">Política de Cookies</a>
                <a href="/termos" className="text-emerald-600 hover:text-emerald-700 underline">Termos de Serviço</a>
              </div>
            </div>
          )}

          {/* ABA: SUBSCRIÇÃO (SAAS B2B) */}
          {activeTab === "billing" && (
            <div className="space-y-6 max-w-3xl">
              
              {/* O Seu Plano (Com Barra de Progresso) */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" /> O Seu Plano
                  </h3>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {currentPlanDetails.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{currentPlanDetails.price}<span className="text-sm font-normal text-gray-500">/mês</span></p>
                    <p className="text-sm text-gray-500 mt-1">Acesso completo a 100% das ferramentas da plataforma.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Atletas Ativos</span>
                      <span className="text-gray-500">{billing.activeClients} / {currentPlanDetails.max === 99999 ? "∞" : currentPlanDetails.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className={`h-2.5 rounded-full transition-all ${usagePercentage > 90 ? "bg-red-500" : usagePercentage > 75 ? "bg-amber-500" : "bg-emerald-500"}`} 
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                    {usagePercentage >= 100 && billing.plan !== "elite" && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Limite atingido. Faça upgrade para adicionar mais alunos.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Planos Disponíveis */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" /> Evolução de Negócio
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Starter */}
                  <div className={`p-5 rounded-2xl border flex flex-col h-full ${billing.plan === "starter" ? "border-emerald-500 bg-emerald-50/30" : "border-gray-200"}`}>
                    <div className="flex-grow">
                      <h4 className="text-gray-900 font-semibold mb-1">Arranque</h4>
                      <p className="text-2xl font-bold text-gray-900 mb-4">39€<span className="text-xs text-gray-500 font-normal">/mês</span></p>
                      <ul className="space-y-2 mb-6 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Até 15 alunos</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Acesso a Todas as Ferramentas</li>
                      </ul>
                    </div>
                    <button disabled={billing.plan === "starter"} className={`w-full py-2 rounded-xl text-sm font-medium transition mt-auto ${billing.plan === "starter" ? "bg-emerald-100 text-emerald-700 cursor-not-allowed" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                      {billing.plan === "starter" ? "Plano Atual" : "Fazer Downgrade"}
                    </button>
                  </div>

                  {/* Pro */}
                  <div className={`p-5 rounded-2xl border relative flex flex-col h-full ${billing.plan === "pro" ? "border-emerald-500 bg-emerald-50/30 shadow-md" : "border-gray-200 shadow-sm"}`}>
                    {billing.plan !== "pro" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Mais Popular
                      </div>
                    )}
                    <div className="flex-grow">
                      <h4 className="text-gray-900 font-semibold mb-1">Escala</h4>
                      <p className="text-2xl font-bold text-gray-900 mb-4">79€<span className="text-xs text-gray-500 font-normal">/mês</span></p>
                      <ul className="space-y-2 mb-6 text-sm text-gray-600">
                        <li className="flex items-center gap-2 font-medium text-gray-900"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Até 50 alunos</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Acesso a Todas as Ferramentas</li>
                      </ul>
                    </div>
                    <button disabled={billing.plan === "pro"} className={`w-full py-2 rounded-xl text-sm font-medium transition mt-auto ${billing.plan === "pro" ? "bg-emerald-100 text-emerald-700 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                      {billing.plan === "pro" ? "Plano Atual" : "Entrar em Contacto"}
                    </button>
                  </div>

                  {/* Elite */}
                  <div className={`p-5 rounded-2xl border flex flex-col h-full ${billing.plan === "elite" ? "border-emerald-500 bg-emerald-50/30" : "border-gray-200"}`}>
                    <div className="flex-grow">
                      <h4 className="text-gray-900 font-semibold mb-1">Ilimitado</h4>
                      <p className="text-2xl font-bold text-gray-900 mb-4">129€<span className="text-xs text-gray-500 font-normal">/mês</span></p>
                      <ul className="space-y-2 mb-6 text-sm text-gray-600">
                        <li className="flex items-center gap-2 font-medium text-gray-900"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Alunos Ilimitados</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Acesso a Todas as Ferramentas</li>
                      </ul>
                    </div>
                    <button disabled={billing.plan === "elite"} className={`w-full py-2 rounded-xl text-sm font-medium transition mt-auto ${billing.plan === "elite" ? "bg-emerald-100 text-emerald-700 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"}`}>
                      {billing.plan === "elite" ? "Plano Atual" : "Entrar em Contacto"}
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}