"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dumbbell, CheckCircle, ArrowRight, ArrowLeft, User, Mail, Phone, Ruler,
  Weight, Target, Lock, Heart, Activity, Utensils, Shield,
} from "lucide-react";

function OnboardingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeFromUrl = searchParams.get("code") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteId, setInviteId] = useState("");

  const [form, setForm] = useState({
    code: codeFromUrl,
    // Step 2: Credenciais
    password: "",
    confirmPassword: "",
    // Step 3: Dados pessoais
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    // Step 4: Corpo
    height: "",
    weight: "",
    bodyFat: "",
    // Step 5: Historial Médico
    medicalConditions: "",
    medications: "",
    allergies: "",
    injuries: "",
    surgeries: "",
    familyHistory: "",
    bloodPressure: "",
    heartRate: "",
    // Step 6: Estilo de Vida
    occupation: "",
    sleepHours: "",
    stressLevel: "",
    smokingStatus: "",
    alcoholConsumption: "",
    activityLevel: "",
    // Step 7: Historial Desportivo
    trainingExperience: "",
    trainingFrequency: "",
    preferredTraining: "",
    sportHistory: "",
    // Step 8: Objetivos
    primaryGoal: "",
    secondaryGoal: "",
    targetWeight: "",
    motivation: "",
    // Step 9: Nutrição
    dietaryRestrictions: "",
    foodAllergies: "",
    mealsPerDay: "",
    waterIntake: "",
    supplementsUsed: "",
    notes: "",
  });

  const TOTAL_STEPS = 9;
  const stepTitles = [
    "Código", "Palavra-passe", "Dados Pessoais", "Dados Físicos",
    "Historial Médico", "Estilo de Vida", "Desporto",
    "Objetivos", "Nutrição",
  ];

  useEffect(() => {
    if (codeFromUrl) validateCode(codeFromUrl);
  }, [codeFromUrl]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const validateCode = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setInviteEmail(data.email);
      setInviteId(data.inviteId);
      setForm((f) => ({ ...f, email: data.email, code }));
      setStep(2);
    } catch {
      setError("Erro de ligação ao servidor");
    }
    setLoading(false);
  };

  const handleNext = () => {
    setError("");
    if (step === 2) {
      if (!form.password || form.password.length < 6) {
        setError("A palavra-passe deve ter pelo menos 6 caracteres");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("As palavras-passe não coincidem");
        return;
      }
    }
    if (step === 3 && !form.name) {
      setError("O nome é obrigatório");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, inviteId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setSuccess(true);
    } catch {
      setError("Erro de ligação ao servidor");
    }
    setLoading(false);
  };

  // ---------- Success screen ----------
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registo Completo!</h1>
          <p className="text-gray-500 mb-6">
            A tua conta e perfil foram criados com sucesso. Já podes fazer login.
          </p>
          <button onClick={() => router.push("/login")} className="btn-primary">
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  // ---------- Helpers ----------
  const InputField = ({ label, icon: Icon, type = "text", field, placeholder, readOnly, ...rest }: {
    label: string; icon?: React.ComponentType<{ className?: string }>; type?: string;
    field: string; placeholder?: string; readOnly?: boolean; [k: string]: unknown;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          type={type}
          value={(form as Record<string, string>)[field] || ""}
          onChange={(e) => set(field, e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`input-field ${Icon ? "pl-10" : ""} ${readOnly ? "bg-gray-50 text-gray-500" : ""}`}
          {...rest}
        />
      </div>
    </div>
  );

  const SelectField = ({ label, icon: Icon, field, options }: {
    label: string; icon?: React.ComponentType<{ className?: string }>;
    field: string; options: { value: string; label: string }[];
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <select
          value={(form as Record<string, string>)[field] || ""}
          onChange={(e) => set(field, e.target.value)}
          className={`input-field ${Icon ? "pl-10" : ""}`}
        >
          <option value="">Selecionar</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );

  const TextArea = ({ label, field, placeholder, rows = 3 }: {
    label: string; field: string; placeholder?: string; rows?: number;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <textarea
        value={(form as Record<string, string>)[field] || ""}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="input-field resize-none"
      />
    </div>
  );

  const NavButtons = ({ isLast }: { isLast?: boolean }) => (
    <div className="flex gap-3 pt-4">
      <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex-1 justify-center">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      {isLast ? (
        <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? "A registar..." : "Concluir Registo"} <CheckCircle className="w-4 h-4" />
        </button>
      ) : (
        <button onClick={handleNext} className="btn-primary flex-1 justify-center">
          Seguinte <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const SectionHint = ({ text }: { text: string }) => (
    <p className="text-xs text-gray-400 italic">{text}</p>
  );

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20 mb-3">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao MKGest</h1>
          <p className="text-gray-500 mt-1">Completa o teu perfil de atleta</p>
        </div>

        {/* Progress */}
        <div className="mb-2 text-center text-xs text-gray-400">
          {step}/{TOTAL_STEPS} — {stepTitles[step - 1]}
        </div>
        <div className="flex items-center justify-center gap-1 mb-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-emerald-500" : s < step ? "w-4 bg-emerald-300" : "w-4 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* ── Step 1: Código ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Código de Convite</h2>
              <p className="text-sm text-gray-500">Introduz o código que recebeste do teu treinador.</p>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Código</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Ex: 123456"
                  className="input-field text-center text-lg tracking-widest"
                  maxLength={24}
                />
              </div>
              <button
                onClick={() => validateCode(form.code)}
                disabled={!form.code || loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? "A verificar..." : "Verificar Código"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Step 2: Palavra-passe ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" /> Criar Palavra-passe
              </h2>
              <p className="text-sm text-gray-500">
                Cria uma palavra-passe para acederes à tua conta. Mínimo 6 caracteres.
              </p>
              <InputField label="Palavra-passe" icon={Lock} type="password" field="password" placeholder="••••••••" />
              <InputField label="Confirmar Palavra-passe" icon={Shield} type="password" field="confirmPassword" placeholder="••••••••" />
              <NavButtons />
            </div>
          )}

          {/* ── Step 3: Dados Pessoais ── */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" /> Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField label="Nome Completo *" icon={User} field="name" placeholder="O teu nome" />
                </div>
                <div className="sm:col-span-2">
                  <InputField label="Email" icon={Mail} field="email" readOnly />
                </div>
                <InputField label="Telemóvel" icon={Phone} field="phone" placeholder="+351 912 345 678" />
                <InputField label="Data de Nascimento" type="date" field="dateOfBirth" />
                <div className="sm:col-span-2">
                  <SelectField label="Género" field="gender" options={[
                    { value: "male", label: "Masculino" },
                    { value: "female", label: "Feminino" },
                    { value: "other", label: "Outro" },
                  ]} />
                </div>
              </div>
              <NavButtons />
            </div>
          )}

          {/* ── Step 4: Dados Físicos ── */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-emerald-500" /> Dados Físicos
              </h2>
              <SectionHint text="Estes dados ajudam o treinador a criar um plano personalizado." />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Altura (cm)" icon={Ruler} type="number" field="height" placeholder="175" />
                <InputField label="Peso (kg)" icon={Weight} type="number" field="weight" placeholder="75" />
              </div>
              <InputField label="% Gordura Corporal" type="number" field="bodyFat" placeholder="20" />
              <NavButtons />
            </div>
          )}

          {/* ── Step 5: Historial Médico ── */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Historial Médico
              </h2>
              <SectionHint text="Informação confidencial — apenas visível para o teu treinador." />
              <TextArea label="Condições Médicas" field="medicalConditions" placeholder="Ex: Diabetes tipo 2, Asma..." />
              <TextArea label="Medicação Atual" field="medications" placeholder="Ex: Metformina 500mg..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextArea label="Alergias" field="allergies" placeholder="Ex: Penicilina..." rows={2} />
                <TextArea label="Lesões" field="injuries" placeholder="Ex: Lesão no joelho esquerdo..." rows={2} />
              </div>
              <TextArea label="Cirurgias Anteriores" field="surgeries" placeholder="Ex: Artroscopia ao joelho (2020)..." rows={2} />
              <TextArea label="Historial Familiar Relevante" field="familyHistory" placeholder="Ex: Historial de doença cardíaca..." rows={2} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Tensão Arterial" field="bloodPressure" placeholder="120/80" />
                <InputField label="Freq. Cardíaca Repouso (BPM)" type="number" field="heartRate" placeholder="70" />
              </div>
              <NavButtons />
            </div>
          )}

          {/* ── Step 6: Estilo de Vida ── */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Estilo de Vida
              </h2>
              <InputField label="Profissão" field="occupation" placeholder="Ex: Programador, Enfermeiro..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Horas de Sono / noite" type="number" field="sleepHours" placeholder="7" />
                <SelectField label="Nível de Stress" field="stressLevel" options={[
                  { value: "1", label: "1 — Muito baixo" },
                  { value: "2", label: "2 — Baixo" },
                  { value: "3", label: "3 — Moderado" },
                  { value: "4", label: "4 — Alto" },
                  { value: "5", label: "5 — Muito alto" },
                ]} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Tabagismo" field="smokingStatus" options={[
                  { value: "never", label: "Nunca fumou" },
                  { value: "former", label: "Ex-fumador" },
                  { value: "current", label: "Fumador" },
                ]} />
                <SelectField label="Consumo de Álcool" field="alcoholConsumption" options={[
                  { value: "none", label: "Nenhum" },
                  { value: "occasional", label: "Ocasional" },
                  { value: "moderate", label: "Moderado" },
                  { value: "heavy", label: "Frequente" },
                ]} />
              </div>
              <SelectField label="Nível de Atividade Física" field="activityLevel" options={[
                { value: "sedentary", label: "Sedentário" },
                { value: "light", label: "Levemente ativo" },
                { value: "moderate", label: "Moderadamente ativo" },
                { value: "active", label: "Ativo" },
                { value: "very_active", label: "Muito ativo" },
              ]} />
              <NavButtons />
            </div>
          )}

          {/* ── Step 7: Historial Desportivo ── */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-amber-500" /> Historial Desportivo
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Experiência de Treino" field="trainingExperience" options={[
                  { value: "none", label: "Sem experiência" },
                  { value: "beginner", label: "Iniciante (< 1 ano)" },
                  { value: "intermediate", label: "Intermédio (1-3 anos)" },
                  { value: "advanced", label: "Avançado (3+ anos)" },
                ]} />
                <InputField label="Treinos / semana" type="number" field="trainingFrequency" placeholder="3" />
              </div>
              <InputField label="Tipo de Treino Preferido" field="preferredTraining" placeholder="Ex: Musculação, CrossFit, Corrida..." />
              <TextArea label="Desportos Praticados" field="sportHistory" placeholder="Ex: Futebol (10 anos), Natação (5 anos)..." />
              <NavButtons />
            </div>
          )}

          {/* ── Step 8: Objetivos ── */}
          {step === 8 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" /> Objetivos
              </h2>
              <SelectField label="Objetivo Principal" icon={Target} field="primaryGoal" options={[
                { value: "weight_loss", label: "Perder Peso" },
                { value: "muscle_gain", label: "Ganhar Músculo" },
                { value: "maintenance", label: "Manutenção" },
                { value: "performance", label: "Performance" },
                { value: "health", label: "Saúde Geral" },
                { value: "rehabilitation", label: "Reabilitação" },
              ]} />
              <InputField label="Objetivo Secundário" field="secondaryGoal" placeholder="Ex: Melhorar flexibilidade..." />
              <InputField label="Peso Alvo (kg)" type="number" field="targetWeight" placeholder="70" />
              <TextArea label="Motivação / Expectativas" field="motivation" placeholder="O que te motivou a começar?" />
              <NavButtons />
            </div>
          )}

          {/* ── Step 9: Nutrição ── */}
          {step === 9 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-500" /> Nutrição
              </h2>
              <SectionHint text="Estes dados são opcionais mas muito úteis para um plano nutricional personalizado." />
              <TextArea label="Restrições Alimentares" field="dietaryRestrictions" placeholder="Ex: Vegetariano, Sem lactose..." />
              <TextArea label="Alergias Alimentares" field="foodAllergies" placeholder="Ex: Marisco, Frutos secos..." rows={2} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Refeições / dia" type="number" field="mealsPerDay" placeholder="5" />
                <InputField label="Água (L / dia)" type="number" field="waterIntake" placeholder="2" />
              </div>
              <TextArea label="Suplementos Utilizados" field="supplementsUsed" placeholder="Ex: Whey Protein, Creatina..." rows={2} />
              <TextArea label="Notas Adicionais" field="notes" placeholder="Alguma informação extra que queiras partilhar..." />
              <NavButtons isLast />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">A carregar...</p>
        </div>
      }
    >
      <OnboardingForm />
    </Suspense>
  );
}
