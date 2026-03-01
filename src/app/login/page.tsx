"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Eye, EyeOff, Shield, LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showRoleChoice, setShowRoleChoice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { ...form, consent };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao processar pedido");
        return;
      }

      // Superadmin gets a choice: admin panel or normal dashboard
      if (data.user?.role === "superadmin") {
        setShowRoleChoice(true);
        return;
      }

      router.push(data.user?.role === "client" ? "/athlete" : "/dashboard");
      router.refresh();
    } catch {
      setError("Erro de ligação ao servidor");
    } finally {
      setLoading(false);
    }
  };

  // Superadmin role choice screen
  if (showRoleChoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20 mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">SIGA180</h1>
            <p className="text-gray-500 mt-2">Bem-vindo de volta!</p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center">
              Para onde queres ir?
            </h2>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Tens acesso de superadmin
            </p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { router.push("/admin"); router.refresh(); }}
                className="flex items-center gap-4 w-full p-4 sm:p-5 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-200 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Painel de Admin</p>
                  <p className="text-xs sm:text-sm text-gray-500">Monitorização, incidentes, utilizadores</p>
                </div>
              </button>

              <button
                onClick={() => { router.push("/dashboard"); router.refresh(); }}
                className="flex items-center gap-4 w-full p-4 sm:p-5 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all duration-200 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">Dashboard PT</p>
                  <p className="text-xs sm:text-sm text-gray-500">Clientes, treinos, nutrição</p>
                </div>
              </button>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            © 2026 joaoazuldev. Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20 mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SIGA180</h1>
          <p className="text-gray-500 mt-2">Plataforma de Gestão para Personal Trainers</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {isLogin ? "Iniciar Sessão" : "Criar Conta"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="O teu nome"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="register-consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                  required
                />
                <label htmlFor="register-consent" className="text-xs text-gray-600 leading-relaxed">
                  Li e aceito a{" "}
                  <a href="/privacy" target="_blank" className="text-emerald-600 underline hover:text-emerald-700">
                    Política de Privacidade
                  </a>.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold rounded-xl transition duration-200 mt-2 shadow-md shadow-emerald-500/20"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  A processar...
                </span>
              ) : isLogin ? "Entrar" : "Registar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
            >
              {isLogin ? "Não tens conta? Regista-te" : "Já tens conta? Inicia sessão"}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © 2026 joaoazuldev. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
