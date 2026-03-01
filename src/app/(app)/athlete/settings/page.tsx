"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  createdAt: string;
}

export default function AthleteSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("As passwords não coincidem");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("A password deve ter pelo menos 6 caracteres");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg("Password alterada com sucesso!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordError(data.error || "Erro ao alterar password");
      }
    } finally {
      setChangingPassword(false);
    }
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
      alert("Erro ao exportar dados. Tenta novamente.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Introduz a tua password para confirmar.");
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
      setDeleteError("Erro de rede. Tenta novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Definições</h1>
        <p className="text-gray-500 mt-1">Gere o teu perfil e preferências</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          Perfil
        </h2>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700">Perfil atualizado!</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Nome
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Opcional"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Save className="w-4 h-4" />
            {saving ? "A guardar..." : "Guardar Alterações"}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          Alterar Password
        </h2>

        {passwordMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700">
            {passwordMsg}
          </div>
        )}
        {passwordError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {passwordError}
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showPasswords ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
              placeholder="Password atual"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input
            type={showPasswords ? "text" : "password"}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Nova password"
          />
          <input
            type={showPasswords ? "text" : "password"}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Confirmar nova password"
          />
          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Lock className="w-4 h-4" />
            {changingPassword ? "A alterar..." : "Alterar Password"}
          </button>
        </div>
      </div>

      {/* Privacy & Data (RGPD) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" />
          Dados e Privacidade
        </h2>
        <p className="text-sm text-gray-500">
          Nos termos do RGPD, tens direito a exportar ou eliminar os teus dados pessoais.{" "}
          <a href="/privacy" className="text-emerald-600 underline hover:text-emerald-700">
            Política de Privacidade
          </a>
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            {exporting ? "A exportar..." : "Exportar Meus Dados"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Conta
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Atenção: esta ação é irreversível</p>
                <p className="text-xs text-red-600 mt-1">
                  A tua conta será desativada e os teus dados pessoais eliminados ao fim do prazo de retenção legal.
                  Introduz a tua password para confirmar.
                </p>
              </div>
            </div>
            {deleteError && (
              <p className="text-sm text-red-700 bg-red-100 rounded-lg px-3 py-2">{deleteError}</p>
            )}
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="A tua password"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "A eliminar..." : "Confirmar Eliminação"}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Conta</h2>
            {profile?.createdAt && (
              <p className="text-sm text-gray-500 mt-1">
                Membro desde {new Date(profile.createdAt).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Terminar Sessão
          </button>
        </div>
      </div>
    </div>
  );
}
