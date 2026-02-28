"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye,
  Mail, Phone, Link, Copy, Check, Key, RefreshCw, ChevronLeft, ChevronRight,
  Heart, Activity, Dumbbell, Target, Apple, FileText, User, AlertTriangle,
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

// ─── Helpers ───────────────────────────────────────────────────
function generatePassword(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
  let p = "";
  for (let i = 0; i < len; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

const InputField = ({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}{required && " *"}</label>
    <input {...props} required={required} className="input-field" />
  </div>
);

const SelectField = ({ label, options, ...props }: { label: string; options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <select {...props} className="input-field">
      <option value="">Selecionar</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const TextArea = ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <textarea {...props} className="input-field min-h-[60px] resize-y" />
  </div>
);

// ─── Step definitions ────────────────────────────────────────
const stepsMeta = [
  { key: "dados", label: "Dados Pessoais", icon: User },
  { key: "acesso", label: "Acesso", icon: Key },
  { key: "fisico", label: "Dados Físicos", icon: Activity },
  { key: "medico", label: "Historial Médico", icon: Heart },
  { key: "lifestyle", label: "Estilo de Vida", icon: FileText },
  { key: "desporto", label: "Desporto", icon: Dumbbell },
  { key: "objetivos", label: "Objetivos", icon: Target },
  { key: "nutricao", label: "Nutrição", icon: Apple },
];

const defaultForm = {
  // step 1 - dados
  name: "", email: "", phone: "", dateOfBirth: "", gender: "",
  status: "active", plan: "", paymentStatus: "pending", notes: "",
  // step 2 - acesso
  password: "", passwordMode: "generate" as "generate" | "manual",
  // step 3 - fisico
  height: "", weight: "", bodyFat: "",
  // step 4 - medico
  medicalConditions: "", medications: "", allergies: "", injuries: "",
  surgeries: "", familyHistory: "", bloodPressure: "", heartRate: "",
  // step 5 - lifestyle
  occupation: "", sleepHours: "", stressLevel: "",
  smokingStatus: "", alcoholConsumption: "", activityLevel: "",
  // step 6 - desporto
  trainingExperience: "", trainingFrequency: "", preferredTraining: "", sportHistory: "",
  // step 7 - objetivos
  primaryGoal: "", secondaryGoal: "", targetWeight: "", motivation: "",
  // step 8 - nutricao
  dietaryRestrictions: "", foodAllergies: "", mealsPerDay: "", waterIntake: "", supplementsUsed: "",
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteType, setInviteType] = useState<"magic_code" | "magic_link">("magic_code");
  const [inviteResult, setInviteResult] = useState<{ code: string; magicLink?: string } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Wizard state
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{ clientId: string; generatedPassword?: string } | null>(null);
  const [createError, setCreateError] = useState("");

  // Edit form (simple)
  const [editForm, setEditForm] = useState({
    name: "", email: "", phone: "", dateOfBirth: "", gender: "",
    status: "active", height: "", weight: "", bodyFat: "",
    plan: "", paymentStatus: "pending", notes: "",
  });

  const f = (key: keyof typeof form, val: string) => setForm({ ...form, [key]: val });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("payment", paymentFilter);
      const res = await fetch(`/api/clients?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); setClients([]); }
    setLoading(false);
  }, [search, statusFilter, paymentFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ─── Create wizard ─────────────────────────────────────────
  const openCreateWizard = () => {
    setForm({ ...defaultForm, password: generatePassword() });
    setStep(0);
    setCreateResult(null);
    setCreateError("");
    setShowCreateWizard(true);
  };

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    const payload = {
      ...form,
      password: form.passwordMode === "generate" ? form.password : form.password,
    };
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      setCreateResult({
        clientId: data.id,
        generatedPassword: data.generatedPassword || (form.passwordMode === "generate" ? form.password : undefined),
      });
      fetchClients();
    } else {
      setCreateError(data.error || "Erro ao criar cliente");
    }
    setCreating(false);
  };

  // ─── Edit ──────────────────────────────────────────────────
  const openEdit = (client: Client) => {
    setEditClient(client);
    setEditForm({
      name: client.name, email: client.email, phone: client.phone || "",
      dateOfBirth: "", gender: "", status: client.status,
      height: client.height?.toString() || "", weight: client.weight?.toString() || "",
      bodyFat: "", plan: client.plan || "", paymentStatus: client.paymentStatus, notes: "",
    });
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClient) return;
    const res = await fetch(`/api/clients/${editClient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditClient(null);
      fetchClients();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao eliminar");
      setDeleteTarget(null);
      setDeleteConfirmText("");
      fetchClients();
    } catch (e) {
      console.error(e);
      alert("Erro ao eliminar o cliente.");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Invite ────────────────────────────────────────────────
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
    const classes: Record<string, string> = { active: "bg-emerald-50 text-emerald-600", inactive: "bg-gray-100 text-gray-500", pending: "bg-yellow-50 text-yellow-600" };
    const labels: Record<string, string> = { active: "Ativo", inactive: "Inativo", pending: "Pendente" };
    return <span className={`badge ${classes[status] || classes.pending}`}>{labels[status] || status}</span>;
  };

  const paymentBadge = (status: string) => {
    const classes: Record<string, string> = { paid: "bg-emerald-50 text-emerald-600", pending: "bg-yellow-50 text-yellow-600", overdue: "bg-red-50 text-red-600" };
    const labels: Record<string, string> = { paid: "Pago", pending: "Pendente", overdue: "Em atraso" };
    return <span className={`badge ${classes[status] || classes.pending}`}>{labels[status] || status}</span>;
  };

  // ─── Wizard step content ───────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0: // Dados Pessoais
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Nome" required placeholder="Nome completo" value={form.name} onChange={(e) => f("name", e.target.value)} />
              <InputField label="Email" required type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => f("email", e.target.value)} />
              <InputField label="Telefone" type="tel" placeholder="+351 912 345 678" value={form.phone} onChange={(e) => f("phone", e.target.value)} />
              <InputField label="Data de Nascimento" type="date" value={form.dateOfBirth} onChange={(e) => f("dateOfBirth", e.target.value)} />
              <SelectField label="Género" value={form.gender} onChange={(e) => f("gender", e.target.value)} options={[{ value: "male", label: "Masculino" }, { value: "female", label: "Feminino" }, { value: "other", label: "Outro" }]} />
              <SelectField label="Estado" value={form.status} onChange={(e) => f("status", e.target.value)} options={[{ value: "active", label: "Ativo" }, { value: "inactive", label: "Inativo" }, { value: "pending", label: "Pendente" }]} />
              <InputField label="Plano" placeholder="Ex: Mensal, Trimestral" value={form.plan} onChange={(e) => f("plan", e.target.value)} />
              <SelectField label="Pagamento" value={form.paymentStatus} onChange={(e) => f("paymentStatus", e.target.value)} options={[{ value: "pending", label: "Pendente" }, { value: "paid", label: "Pago" }, { value: "overdue", label: "Em atraso" }]} />
            </div>
            <TextArea label="Notas" placeholder="Notas sobre o cliente..." value={form.notes} onChange={(e) => f("notes", e.target.value)} />
          </div>
        );

      case 1: // Acesso / Password
        return (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">Define a palavra-passe para o atleta aceder à plataforma.</p>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${form.passwordMode === "generate" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"}`}>
                <input type="radio" checked={form.passwordMode === "generate"} onChange={() => setForm({ ...form, passwordMode: "generate", password: generatePassword() })} className="text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Gerar automaticamente</p>
                  <p className="text-xs text-gray-500">Password segura e aleatória</p>
                </div>
              </label>
              <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${form.passwordMode === "manual" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"}`}>
                <input type="radio" checked={form.passwordMode === "manual"} onChange={() => setForm({ ...form, passwordMode: "manual", password: "" })} className="text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Definir manualmente</p>
                  <p className="text-xs text-gray-500">Escolher uma password</p>
                </div>
              </label>
            </div>

            {form.passwordMode === "generate" ? (
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-xs font-medium text-gray-500 mb-2">Password gerada</label>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-lg font-mono font-semibold text-gray-900 tracking-wider bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                    {form.password}
                  </code>
                  <button type="button" onClick={() => f("password", generatePassword())} className="p-2.5 rounded-lg hover:bg-gray-200 transition" title="Gerar nova">
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                  <button type="button" onClick={() => copyToClipboard(form.password)} className="p-2.5 rounded-lg hover:bg-gray-200 transition" title="Copiar">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Guarda e partilha esta password com o atleta. Pode ser alterada depois.</p>
              </div>
            ) : (
              <div>
                <InputField label="Password" type="text" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => f("password", e.target.value)} />
                {form.password.length > 0 && form.password.length < 6 && (
                  <p className="text-xs text-red-500 mt-1">Mínimo 6 caracteres</p>
                )}
              </div>
            )}
          </div>
        );

      case 2: // Dados Físicos
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Altura (cm)" type="number" placeholder="175" value={form.height} onChange={(e) => f("height", e.target.value)} />
            <InputField label="Peso (kg)" type="number" step="0.1" placeholder="75.5" value={form.weight} onChange={(e) => f("weight", e.target.value)} />
            <InputField label="% Gordura" type="number" step="0.1" placeholder="15.0" value={form.bodyFat} onChange={(e) => f("bodyFat", e.target.value)} />
          </div>
        );

      case 3: // Historial Médico
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextArea label="Condições Médicas" placeholder="Ex: Diabetes, Asma..." value={form.medicalConditions} onChange={(e) => f("medicalConditions", e.target.value)} />
              <TextArea label="Medicação Atual" placeholder="Medicamentos em uso..." value={form.medications} onChange={(e) => f("medications", e.target.value)} />
              <TextArea label="Alergias" placeholder="Alergias conhecidas..." value={form.allergies} onChange={(e) => f("allergies", e.target.value)} />
              <TextArea label="Lesões" placeholder="Lesões passadas ou atuais..." value={form.injuries} onChange={(e) => f("injuries", e.target.value)} />
              <TextArea label="Cirurgias" placeholder="Cirurgias realizadas..." value={form.surgeries} onChange={(e) => f("surgeries", e.target.value)} />
              <TextArea label="Historial Familiar" placeholder="Doenças familiares relevantes..." value={form.familyHistory} onChange={(e) => f("familyHistory", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Tensão Arterial" placeholder="120/80" value={form.bloodPressure} onChange={(e) => f("bloodPressure", e.target.value)} />
              <InputField label="Freq. Cardíaca (BPM)" type="number" placeholder="70" value={form.heartRate} onChange={(e) => f("heartRate", e.target.value)} />
            </div>
          </div>
        );

      case 4: // Estilo de Vida
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Profissão" placeholder="Ex: Engenheiro, Estudante" value={form.occupation} onChange={(e) => f("occupation", e.target.value)} />
            <InputField label="Horas de Sono" type="number" step="0.5" placeholder="7.5" value={form.sleepHours} onChange={(e) => f("sleepHours", e.target.value)} />
            <SelectField label="Nível de Stress" value={form.stressLevel} onChange={(e) => f("stressLevel", e.target.value)} options={[{ value: "1", label: "1 — Muito baixo" }, { value: "2", label: "2 — Baixo" }, { value: "3", label: "3 — Moderado" }, { value: "4", label: "4 — Alto" }, { value: "5", label: "5 — Muito alto" }]} />
            <SelectField label="Tabaco" value={form.smokingStatus} onChange={(e) => f("smokingStatus", e.target.value)} options={[{ value: "never", label: "Nunca fumou" }, { value: "former", label: "Ex-fumador" }, { value: "current", label: "Fumador" }]} />
            <SelectField label="Álcool" value={form.alcoholConsumption} onChange={(e) => f("alcoholConsumption", e.target.value)} options={[{ value: "none", label: "Nenhum" }, { value: "occasional", label: "Ocasional" }, { value: "moderate", label: "Moderado" }, { value: "heavy", label: "Elevado" }]} />
            <SelectField label="Nível de Atividade" value={form.activityLevel} onChange={(e) => f("activityLevel", e.target.value)} options={[{ value: "sedentary", label: "Sedentário" }, { value: "light", label: "Ligeiramente ativo" }, { value: "moderate", label: "Moderadamente ativo" }, { value: "active", label: "Ativo" }, { value: "very_active", label: "Muito ativo" }]} />
          </div>
        );

      case 5: // Desporto
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Experiência de Treino" value={form.trainingExperience} onChange={(e) => f("trainingExperience", e.target.value)} options={[{ value: "none", label: "Nenhuma" }, { value: "beginner", label: "Iniciante" }, { value: "intermediate", label: "Intermédio" }, { value: "advanced", label: "Avançado" }]} />
            <InputField label="Frequência Semanal (dias)" type="number" min="0" max="7" placeholder="3" value={form.trainingFrequency} onChange={(e) => f("trainingFrequency", e.target.value)} />
            <InputField label="Tipo de Treino Preferido" placeholder="Ex: Musculação, CrossFit" value={form.preferredTraining} onChange={(e) => f("preferredTraining", e.target.value)} />
            <TextArea label="Historial Desportivo" placeholder="Desportos praticados, competições..." value={form.sportHistory} onChange={(e) => f("sportHistory", e.target.value)} />
          </div>
        );

      case 6: // Objetivos
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Objetivo Principal" value={form.primaryGoal} onChange={(e) => f("primaryGoal", e.target.value)} options={[{ value: "weight_loss", label: "Perda de peso" }, { value: "muscle_gain", label: "Ganho muscular" }, { value: "maintenance", label: "Manutenção" }, { value: "performance", label: "Performance" }, { value: "health", label: "Saúde geral" }, { value: "rehabilitation", label: "Reabilitação" }]} />
            <SelectField label="Objetivo Secundário" value={form.secondaryGoal} onChange={(e) => f("secondaryGoal", e.target.value)} options={[{ value: "weight_loss", label: "Perda de peso" }, { value: "muscle_gain", label: "Ganho muscular" }, { value: "maintenance", label: "Manutenção" }, { value: "performance", label: "Performance" }, { value: "health", label: "Saúde geral" }, { value: "rehabilitation", label: "Reabilitação" }]} />
            <InputField label="Peso Alvo (kg)" type="number" step="0.1" placeholder="70.0" value={form.targetWeight} onChange={(e) => f("targetWeight", e.target.value)} />
            <TextArea label="Motivação / Expectativas" placeholder="O que motiva o atleta..." value={form.motivation} onChange={(e) => f("motivation", e.target.value)} />
          </div>
        );

      case 7: // Nutrição
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextArea label="Restrições Alimentares" placeholder="Vegetariano, sem glúten..." value={form.dietaryRestrictions} onChange={(e) => f("dietaryRestrictions", e.target.value)} />
            <TextArea label="Alergias Alimentares" placeholder="Frutos secos, lactose..." value={form.foodAllergies} onChange={(e) => f("foodAllergies", e.target.value)} />
            <InputField label="Refeições por Dia" type="number" placeholder="5" value={form.mealsPerDay} onChange={(e) => f("mealsPerDay", e.target.value)} />
            <InputField label="Água (L/dia)" type="number" step="0.1" placeholder="2.0" value={form.waterIntake} onChange={(e) => f("waterIntake", e.target.value)} />
            <TextArea label="Suplementos Utilizados" placeholder="Whey, creatina..." value={form.supplementsUsed} onChange={(e) => f("supplementsUsed", e.target.value)} />
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = step === 0 ? !!(form.name && form.email) : true;

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${clients.length} cliente(s) registado(s)`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowInviteModal(true); setInviteResult(null); setInviteEmail(""); }} className="btn-secondary">
              <Link className="w-4 h-4" /> Convidar
            </button>
            <button onClick={openCreateWizard} className="btn-primary">
              <Plus className="w-4 h-4" /> Novo Cliente
            </button>
          </div>
        }
      />

      {/* Stats Summary */}
      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Ativos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{clients.filter(c => c.status === "active").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-yellow-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-yellow-500 uppercase tracking-wider">Pgto. Pendente</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{clients.filter(c => c.paymentStatus === "pending").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-red-500 uppercase tracking-wider">Pgto. Em Atraso</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{clients.filter(c => c.paymentStatus === "overdue").length}</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Pesquisar clientes..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field pl-10 pr-8 appearance-none">
            <option value="">Todos os estados</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="pending">Pendentes</option>
          </select>
        </div>
        <div className="relative">
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="input-field pr-8 appearance-none">
            <option value="">Todos os pagamentos</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="overdue">Em atraso</option>
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
          action={<button onClick={openCreateWizard} className="btn-primary"><Plus className="w-4 h-4" /> Adicionar Cliente</button>}
        />
      ) : (
        <div className="grid gap-4">
          <div className="hidden lg:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <span>Cliente</span>
            <span>Contacto</span>
            <span>Plano</span>
            <span>Estado</span>
            <span>Pagamento</span>
            <span></span>
          </div>

          {clients.map((client) => (
            <div key={client.id} onClick={() => router.push(`/clients/${client.id}`)} className="card hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="lg:grid lg:grid-cols-[1fr_1fr_auto_auto_auto_auto] lg:gap-4 lg:items-center space-y-3 lg:space-y-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-semibold shrink-0">
                    {client.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                    {client.weight && <p className="text-xs text-gray-400">{client.weight}kg {client.height ? `• ${client.height}cm` : ""}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" /><span className="truncate">{client.email}</span></div>
                  {client.phone && <div className="flex items-center gap-2 text-sm text-gray-500"><Phone className="w-3.5 h-3.5" /><span>{client.phone}</span></div>}
                </div>
                <div className="text-sm text-gray-500">{client.plan || "—"}</div>
                {statusBadge(client.status)}
                {paymentBadge(client.paymentStatus)}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === client.id ? null : client.id)} className="p-2 hover:bg-white rounded-lg transition">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  {menuOpen === client.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-44">
                        <button onClick={() => { router.push(`/clients/${client.id}`); setMenuOpen(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                          <Eye className="w-4 h-4" /> Ver Detalhes
                        </button>
                        <button onClick={() => openEdit(client)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                          <Edit className="w-4 h-4" /> Editar
                        </button>
                        <button onClick={() => { setDeleteTarget({ id: client.id, name: client.name }); setDeleteConfirmText(""); setMenuOpen(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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

      {/* ─── Create Wizard Modal ──────────────────────────── */}
      <Modal
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        title={createResult ? "Cliente Criado!" : "Novo Cliente — Onboarding / Anamnese"}
        size="xl"
      >
        {createResult ? (
          <div className="text-center space-y-5 py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cliente criado com sucesso!</h3>
              <p className="text-sm text-gray-500 mt-1">O atleta já pode aceder à plataforma com as credenciais abaixo.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left">
              <div>
                <p className="text-xs font-medium text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">{form.email}</p>
              </div>
              {createResult.generatedPassword && (
                <div>
                  <p className="text-xs font-medium text-gray-400">Password</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-semibold text-gray-900">{createResult.generatedPassword}</code>
                    <button onClick={() => copyToClipboard(createResult.generatedPassword!)} className="p-1 rounded hover:bg-gray-200">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">Partilha estas credenciais com o atleta de forma segura.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => { setShowCreateWizard(false); router.push(`/clients/${createResult.clientId}`); }} className="btn-secondary">
                Ver Perfil
              </button>
              <button onClick={() => setShowCreateWizard(false)} className="btn-primary">
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Step indicator */}
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
              {stepsMeta.map((s, i) => {
                const Icon = s.icon;
                const active = i === step;
                const done = i < step;
                return (
                  <button
                    key={s.key}
                    onClick={() => i <= step && setStep(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      active ? "bg-emerald-100 text-emerald-700" : done ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Step title */}
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {stepsMeta[step].label}
              {step >= 2 && <span className="text-xs font-normal text-gray-400 ml-2">— opcional, pode preencher depois</span>}
            </h3>

            {/* Step content */}
            {renderStep()}

            {/* Error */}
            {createError && <p className="text-sm text-red-500 mt-4 bg-red-50 rounded-lg p-3">{createError}</p>}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <span className="text-xs text-gray-400">{step + 1} / {stepsMeta.length}</span>

              {step < stepsMeta.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed}
                  className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Seguinte <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!form.name || !form.email || (form.passwordMode === "manual" && form.password.length < 6) || creating}
                  className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {creating ? "A criar..." : "Criar Cliente"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Edit Modal (quick) ───────────────────────────── */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditClient(null); }} title="Editar Cliente" size="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Email *</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Estado</label><select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-field"><option value="active">Ativo</option><option value="inactive">Inativo</option><option value="pending">Pendente</option></select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-500 mb-1">Altura (cm)</label><input type="number" value={editForm.height} onChange={(e) => setEditForm({ ...editForm, height: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-500 mb-1">Peso (kg)</label><input type="number" step="0.1" value={editForm.weight} onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-500 mb-1">% Gordura</label><input type="number" step="0.1" value={editForm.bodyFat} onChange={(e) => setEditForm({ ...editForm, bodyFat: e.target.value })} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-500 mb-1">Plano</label><input type="text" value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-500 mb-1">Pagamento</label><select value={editForm.paymentStatus} onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })} className="input-field"><option value="pending">Pendente</option><option value="paid">Pago</option><option value="overdue">Em atraso</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Notas</label><textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="input-field min-h-[60px] resize-y" /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => { setShowEditModal(false); setEditClient(null); }} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* ─── Invite Modal ─────────────────────────────────── */}
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
                    <div><p className="text-sm font-medium text-gray-900">Código</p><p className="text-xs text-gray-500">6 dígitos</p></div>
                  </label>
                  <label className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${inviteType === "magic_link" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" checked={inviteType === "magic_link"} onChange={() => setInviteType("magic_link")} className="text-emerald-500 focus:ring-emerald-500" />
                    <div><p className="text-sm font-medium text-gray-900">Link Mágico</p><p className="text-xs text-gray-500">URL único</p></div>
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

      {/* ─── Delete Confirmation Modal ───────────────────── */}
      <Modal isOpen={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteConfirmText(""); }} title="Eliminar Cliente" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Esta ação é irreversível!</p>
              <p>Ao eliminar <strong>{deleteTarget?.name}</strong>, todos os dados serão permanentemente apagados:</p>
              <ul className="mt-2 ml-4 list-disc space-y-0.5 text-red-700">
                <li>Conta de acesso (login)</li>
                <li>Planos de treino e nutrição atribuídos</li>
                <li>Check-ins e avaliações corporais</li>
                <li>Reservas e agendamentos</li>
                <li>Mensagens e conversas</li>
                <li>Feedbacks e notificações</li>
              </ul>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escreve <span className="font-bold text-red-600">APAGAR</span> para confirmar:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="APAGAR"
              className="input-field text-center font-mono text-lg tracking-widest"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button
              onClick={handleDelete}
              disabled={deleteConfirmText !== "APAGAR" || deleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "A eliminar..." : "Eliminar Permanentemente"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
