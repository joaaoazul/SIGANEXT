"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Edit, Trash2, Save, X, Mail, Phone, Calendar, Ruler, Weight,
  Activity, Dumbbell, UtensilsCrossed, MessageSquare, Plus, Heart,
  Target, Utensils, User, Briefcase, ClipboardCheck, AlertTriangle,
  Camera, Image, Droplets, Flame, Calculator, Upload, Eye, ChevronDown, ChevronUp,
} from "lucide-react";
import Modal from "@/components/Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  status: string;
  height: number | null;
  weight: number | null;
  bodyFat: number | null;
  // Medical
  medicalConditions: string | null;
  medications: string | null;
  allergies: string | null;
  injuries: string | null;
  surgeries: string | null;
  familyHistory: string | null;
  bloodPressure: string | null;
  heartRate: number | null;
  // Lifestyle
  occupation: string | null;
  sleepHours: number | null;
  stressLevel: number | null;
  smokingStatus: string | null;
  alcoholConsumption: string | null;
  activityLevel: string | null;
  // Sports
  trainingExperience: string | null;
  trainingFrequency: number | null;
  preferredTraining: string | null;
  sportHistory: string | null;
  // Goals
  primaryGoal: string | null;
  secondaryGoal: string | null;
  targetWeight: number | null;
  motivation: string | null;
  // Nutrition
  dietaryRestrictions: string | null;
  foodAllergies: string | null;
  mealsPerDay: number | null;
  waterIntake: number | null;
  supplementsUsed: string | null;
  notes: string | null;
  plan: string | null;
  paymentStatus: string;
  createdAt: string;
  trainingPlans: { id: string; isActive: boolean; trainingPlan: { id: string; name: string } }[];
  nutritionPlans: { id: string; isActive: boolean; nutritionPlan: { id: string; name: string } }[];
  feedbacks: { id: string; subject: string; status: string; createdAt: string; message: string }[];
  bodyAssessments: {
    id: string; date: string; weight: number | null; bodyFat: number | null;
    muscleMass: number | null; chest: number | null; waist: number | null; hips: number | null;
    arms: number | null; thighs: number | null; calves: number | null;
    shoulders: number | null; neck: number | null; abdomen: number | null;
    visceralFat: number | null; bmi: number | null; bmr: number | null;
    waterPct: number | null; boneMass: number | null; metabolicAge: number | null;
    photos: string | null; notes: string | null;
  }[];
  checkIns: {
    id: string; date: string; mood: number | null; energy: number | null;
    sleep: number | null; soreness: number | null; stress: number | null;
    trainedToday: boolean; followedDiet: boolean; waterLiters: number | null;
    weight: number | null; notes: string | null;
  }[];
}

type TabKey = "resumo" | "medico" | "lifestyle" | "desporto" | "objetivos" | "nutricao" | "avaliacoes" | "ferramentas" | "checkins" | "planos" | "diario";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "resumo", label: "Resumo", icon: User },
  { key: "medico", label: "Médico", icon: Heart },
  { key: "lifestyle", label: "Estilo de Vida", icon: Briefcase },
  { key: "desporto", label: "Desporto", icon: Dumbbell },
  { key: "objetivos", label: "Objetivos", icon: Target },
  { key: "nutricao", label: "Nutrição", icon: Utensils },
  { key: "diario", label: "Diário Alimentar", icon: Flame },
  { key: "avaliacoes", label: "Avaliações", icon: Activity },
  { key: "ferramentas", label: "Ferramentas", icon: Calculator },
  { key: "checkins", label: "Check-ins", icon: ClipboardCheck },
  { key: "planos", label: "Planos", icon: UtensilsCrossed },
];

const PHOTO_LABELS = [
  { value: "front", label: "Frente" },
  { value: "back", label: "Costas" },
  { value: "side_left", label: "Lado Esquerdo" },
  { value: "side_right", label: "Lado Direito" },
  { value: "front_flex", label: "Frente (Flexão)" },
  { value: "back_flex", label: "Costas (Flexão)" },
];

const photoLabelMap: Record<string, string> = {};
PHOTO_LABELS.forEach(p => { photoLabelMap[p.value] = p.label; });

// Labels
const goalLabels: Record<string, string> = {
  weight_loss: "Perder Peso", muscle_gain: "Ganhar Músculo", maintenance: "Manutenção",
  performance: "Performance", health: "Saúde Geral", rehabilitation: "Reabilitação",
};
const activityLabels: Record<string, string> = {
  sedentary: "Sedentário", light: "Levemente ativo", moderate: "Moderadamente ativo",
  active: "Ativo", very_active: "Muito ativo",
};
const expLabels: Record<string, string> = {
  none: "Sem experiência", beginner: "Iniciante", intermediate: "Intermédio", advanced: "Avançado",
};
const smokingLabels: Record<string, string> = { never: "Nunca fumou", former: "Ex-fumador", current: "Fumador" };
const alcoholLabels: Record<string, string> = { none: "Nenhum", occasional: "Ocasional", moderate: "Moderado", heavy: "Frequente" };

// ─── Food Log Tab Component ─────────────────────────────────────
function FoodLogTab({ clientId }: { clientId: string }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clients/${clientId}/food-logs?date=${date}&days=1`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId, date]);

  const mealTypeLabels: Record<string, string> = {
    breakfast: "Pequeno-Almoço", lunch: "Almoço", dinner: "Jantar",
    snack_morning: "Lanche Manhã", snack_afternoon: "Lanche Tarde", snack_evening: "Lanche Noite", other: "Outro",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field max-w-[180px]" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(date).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">A carregar...</div>
      ) : !data?.foodLogs?.length ? (
        <div className="card text-center py-8">
          <Flame className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Sem registos neste dia</p>
        </div>
      ) : (
        <>
          {/* Daily summary */}
          {data.dailySummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Calorias", value: `${Math.round(data.dailySummary.totalCalories)} kcal`, color: "text-orange-600 bg-orange-50" },
                { label: "Proteína", value: `${Math.round(data.dailySummary.totalProtein)}g`, color: "text-blue-600 bg-blue-50" },
                { label: "Carbs", value: `${Math.round(data.dailySummary.totalCarbs)}g`, color: "text-amber-600 bg-amber-50" },
                { label: "Gordura", value: `${Math.round(data.dailySummary.totalFat)}g`, color: "text-red-600 bg-red-50" },
              ].map(s => (
                <div key={s.label} className="card text-center py-3">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Water */}
          {data.waterLogs?.length > 0 && (
            <div className="card flex items-center gap-3">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Água: {data.waterLogs.reduce((a: number, w: any) => a + (w.amount || 0), 0)} ml
              </span>
            </div>
          )}

          {/* Meals */}
          {data.foodLogs.map((log: any) => (
            <div key={log.id} className="card">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {mealTypeLabels[log.mealType] || log.mealType}
                <span className="text-xs font-normal text-gray-400 ml-2">
                  {new Date(log.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </h4>
              {log.entries?.length > 0 ? (
                <div className="space-y-2">
                  {log.entries.map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <span className="text-gray-700 dark:text-gray-300">{entry.food?.name || "Alimento"}</span>
                        <span className="text-gray-400 ml-2">({entry.quantity}g)</span>
                      </div>
                      <span className="text-gray-500 text-xs">{Math.round((entry.food?.calories || 0) * entry.quantity / 100)} kcal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sem alimentos registados</p>
              )}
              {log.photoUrl && (
                <img src={log.photoUrl} alt="Foto da refeição" className="mt-3 rounded-lg max-h-40 object-cover" loading="lazy" />
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("resumo");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    weight: "", bodyFat: "", muscleMass: "", chest: "", waist: "", hips: "", arms: "", thighs: "",
    calves: "", shoulders: "", neck: "", abdomen: "",
    visceralFat: "", waterPct: "", boneMass: "", metabolicAge: "",
    notes: "",
  });
  const [assessmentPhotos, setAssessmentPhotos] = useState<{url: string; label: string; path: string}[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedGalleryAssessment, setSelectedGalleryAssessment] = useState<string | null>(null);
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/clients/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setClient(data);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  const startEdit = () => {
    if (!client) return;
    setEditData({ ...client });
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setEditData({}); };

  const saveEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/clients/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      await fetchClient();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleUploadPhoto = async (file: File, label: string) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `clients/${params.id}/assessments`);
      formData.append("label", label);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setAssessmentPhotos(prev => [...prev, { url: data.url, label: data.label, path: data.path }]);
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao fazer upload");
      }
    } catch { alert("Erro ao fazer upload da foto"); }
    setUploadingPhoto(false);
  };

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/clients/${params.id}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...assessmentForm, photos: assessmentPhotos.length > 0 ? assessmentPhotos : undefined }),
    });
    if (res.ok) {
      setShowAssessment(false);
      setAssessmentForm({
        weight: "", bodyFat: "", muscleMass: "", chest: "", waist: "", hips: "", arms: "", thighs: "",
        calves: "", shoulders: "", neck: "", abdomen: "",
        visceralFat: "", waterPct: "", boneMass: "", metabolicAge: "",
        notes: "",
      });
      setAssessmentPhotos([]);
      fetchClient();
    }
  };

  // ─── Fitness Calculator Helpers ───
  const calcIMC = () => {
    const w = client?.weight; const h = client?.height;
    if (!w || !h) return null;
    return Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  };
  const imcCategory = (imc: number) => {
    if (imc < 18.5) return { label: "Abaixo do peso", color: "text-blue-600", bg: "bg-blue-50" };
    if (imc < 25) return { label: "Peso normal", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (imc < 30) return { label: "Sobrepeso", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (imc < 35) return { label: "Obesidade I", color: "text-orange-600", bg: "bg-orange-50" };
    if (imc < 40) return { label: "Obesidade II", color: "text-red-600", bg: "bg-red-50" };
    return { label: "Obesidade III", color: "text-red-700", bg: "bg-red-100" };
  };
  const calcTMB = () => {
    const w = client?.weight; const h = client?.height;
    if (!w || !h || !client?.dateOfBirth || !client?.gender) return null;
    const age = Math.floor((Date.now() - new Date(client.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (client.gender === "male") return Math.round(10 * w + 6.25 * h - 5 * age + 5);
    return Math.round(10 * w + 6.25 * h - 5 * age - 161);
  };
  const activityMultipliers: Record<string, { label: string; factor: number }> = {
    sedentary: { label: "Sedentário", factor: 1.2 },
    light: { label: "Lev. ativo", factor: 1.375 },
    moderate: { label: "Mod. ativo", factor: 1.55 },
    active: { label: "Ativo", factor: 1.725 },
    very_active: { label: "Muito ativo", factor: 1.9 },
  };
  const calcTDEE = () => {
    const tmb = calcTMB();
    if (!tmb || !client?.activityLevel) return null;
    const mult = activityMultipliers[client.activityLevel];
    return mult ? Math.round(tmb * mult.factor) : null;
  };
  const calcWater = () => {
    const w = client?.weight;
    if (!w) return null;
    return Math.round(w * 0.035 * 10) / 10;
  };
  const calcMacros = () => {
    const tdee = calcTDEE();
    if (!tdee || !client?.primaryGoal) return null;
    let cal = tdee;
    if (client.primaryGoal === "weight_loss") cal = Math.round(tdee * 0.8);
    else if (client.primaryGoal === "muscle_gain") cal = Math.round(tdee * 1.15);
    const w = client.weight || 70;
    const protein = Math.round(w * (client.primaryGoal === "muscle_gain" ? 2.2 : 1.8));
    const fat = Math.round(cal * 0.25 / 9);
    const carbsCal = cal - (protein * 4) - (fat * 9);
    const carbs = Math.round(carbsCal / 4);
    return { calories: cal, protein, carbs, fat };
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao eliminar");
      router.push("/clients");
    } catch (e) {
      console.error(e);
      alert("Erro ao eliminar o cliente.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Cliente não encontrado</p>
        <button onClick={() => router.push("/clients")} className="btn-primary mt-4">Voltar</button>
      </div>
    );
  }

  // ─── Helpers ───
  const Field = ({ label, value, suffix }: { label: string; value: any; suffix?: string }) => (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 dark:text-gray-200">{value != null && value !== "" ? `${value}${suffix || ""}` : "—"}</p>
    </div>
  );

  const EditField = ({ label, field, type = "text", options }: {
    label: string; field: string; type?: string; options?: { value: string; label: string }[];
  }) => {
    if (options) {
      return (
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
          <select value={editData[field] || ""} onChange={(e) => setEditData({ ...editData, [field]: e.target.value })} className="input-field text-sm">
            <option value="">—</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    }
    if (type === "textarea") {
      return (
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
          <textarea value={editData[field] || ""} onChange={(e) => setEditData({ ...editData, [field]: e.target.value })} rows={2} className="input-field text-sm resize-none" />
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <input type={type} value={editData[field] ?? ""} onChange={(e) => setEditData({ ...editData, [field]: e.target.value })} className="input-field text-sm" />
      </div>
    );
  };

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );

  // ─── TAB CONTENT ───
  const renderTab = () => {
    switch (tab) {
      case "resumo":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SectionCard title="Informações de Contacto">
                {editing ? (
                  <div className="space-y-3">
                    <EditField label="Nome" field="name" />
                    <EditField label="Email" field="email" />
                    <EditField label="Telemóvel" field="phone" />
                    <EditField label="Data de Nascimento" field="dateOfBirth" type="date" />
                    <EditField label="Género" field="gender" options={[
                      { value: "male", label: "Masculino" },
                      { value: "female", label: "Feminino" },
                      { value: "other", label: "Outro" },
                    ]} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600 dark:text-gray-300">{client.email}</span></div>
                    {client.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600 dark:text-gray-300">{client.phone}</span></div>}
                    {client.dateOfBirth && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600 dark:text-gray-300">{new Date(client.dateOfBirth).toLocaleDateString("pt-PT")}</span></div>}
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600 dark:text-gray-300">{client.gender === "male" ? "Masculino" : client.gender === "female" ? "Feminino" : client.gender || "—"}</span></div>
                    <div className="pt-2 flex gap-2">
                      <span className={`badge ${client.status === "active" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Dados Físicos">
                {editing ? (
                  <div className="space-y-3">
                    <EditField label="Altura (cm)" field="height" type="number" />
                    <EditField label="Peso (kg)" field="weight" type="number" />
                    <EditField label="% Gordura" field="bodyFat" type="number" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Ruler className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{client.height || "—"}</p>
                      <p className="text-xs text-gray-400">cm</p>
                    </div>
                    <div>
                      <Weight className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{client.weight || "—"}</p>
                      <p className="text-xs text-gray-400">kg</p>
                    </div>
                    <div>
                      <Activity className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{client.bodyFat || "—"}</p>
                      <p className="text-xs text-gray-400">% gordura</p>
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Planos Ativos">
                <div className="space-y-3">
                  {client.trainingPlans.filter(tp => tp.isActive).map((tp) => (
                    <div key={tp.id} className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{tp.trainingPlan.name}</span>
                    </div>
                  ))}
                  {client.nutritionPlans.filter(np => np.isActive).map((np) => (
                    <div key={np.id} className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{np.nutritionPlan.name}</span>
                    </div>
                  ))}
                  {client.trainingPlans.filter(tp => tp.isActive).length === 0 &&
                   client.nutritionPlans.filter(np => np.isActive).length === 0 && (
                    <p className="text-sm text-gray-400">Nenhum plano ativo</p>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Quick Anamnesis Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-100 dark:border-rose-800/30">
                <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-rose-500" /><span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">Médico</span></div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{client.medicalConditions || "Sem condições registadas"}</p>
                {client.injuries && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Lesões: {client.injuries}</p>}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-2"><Briefcase className="w-4 h-4 text-blue-500" /><span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase">Estilo de Vida</span></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{client.occupation || "—"}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{activityLabels[client.activityLevel || ""] || "Nível de atividade não definido"}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-purple-500" /><span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase">Objetivo</span></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{goalLabels[client.primaryGoal || ""] || "Não definido"}</p>
                {client.targetWeight && <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Peso alvo: {client.targetWeight}kg</p>}
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
                <div className="flex items-center gap-2 mb-2"><Dumbbell className="w-4 h-4 text-amber-500" /><span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">Desporto</span></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{expLabels[client.trainingExperience || ""] || "Não definido"}</p>
                {client.trainingFrequency && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{client.trainingFrequency}x/semana</p>}
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <SectionCard title="Notas">
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{client.notes}</p>
              </SectionCard>
            )}
          </div>
        );

      case "medico":
        return (
          <SectionCard title="Historial Médico">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditField label="Condições Médicas" field="medicalConditions" type="textarea" />
                <EditField label="Medicação Atual" field="medications" type="textarea" />
                <EditField label="Alergias" field="allergies" type="textarea" />
                <EditField label="Lesões" field="injuries" type="textarea" />
                <EditField label="Cirurgias" field="surgeries" type="textarea" />
                <EditField label="Historial Familiar" field="familyHistory" type="textarea" />
                <EditField label="Tensão Arterial" field="bloodPressure" />
                <EditField label="Freq. Cardíaca em Repouso (BPM)" field="heartRate" type="number" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Condições Médicas" value={client.medicalConditions} />
                <Field label="Medicação Atual" value={client.medications} />
                <Field label="Alergias" value={client.allergies} />
                <Field label="Lesões" value={client.injuries} />
                <Field label="Cirurgias" value={client.surgeries} />
                <Field label="Historial Familiar" value={client.familyHistory} />
                <Field label="Tensão Arterial" value={client.bloodPressure} />
                <Field label="Freq. Cardíaca Repouso" value={client.heartRate} suffix=" BPM" />
              </div>
            )}
          </SectionCard>
        );

      case "lifestyle":
        return (
          <SectionCard title="Estilo de Vida">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditField label="Profissão" field="occupation" />
                <EditField label="Horas de Sono / noite" field="sleepHours" type="number" />
                <EditField label="Nível de Stress" field="stressLevel" options={[
                  { value: "1", label: "1 — Muito baixo" }, { value: "2", label: "2 — Baixo" },
                  { value: "3", label: "3 — Moderado" }, { value: "4", label: "4 — Alto" },
                  { value: "5", label: "5 — Muito alto" },
                ]} />
                <EditField label="Tabagismo" field="smokingStatus" options={[
                  { value: "never", label: "Nunca fumou" }, { value: "former", label: "Ex-fumador" }, { value: "current", label: "Fumador" },
                ]} />
                <EditField label="Consumo de Álcool" field="alcoholConsumption" options={[
                  { value: "none", label: "Nenhum" }, { value: "occasional", label: "Ocasional" },
                  { value: "moderate", label: "Moderado" }, { value: "heavy", label: "Frequente" },
                ]} />
                <EditField label="Nível de Atividade" field="activityLevel" options={[
                  { value: "sedentary", label: "Sedentário" }, { value: "light", label: "Levemente ativo" },
                  { value: "moderate", label: "Moderadamente ativo" }, { value: "active", label: "Ativo" },
                  { value: "very_active", label: "Muito ativo" },
                ]} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Profissão" value={client.occupation} />
                <Field label="Horas de Sono" value={client.sleepHours} suffix="h" />
                <Field label="Nível de Stress" value={client.stressLevel ? `${client.stressLevel}/5` : null} />
                <Field label="Tabagismo" value={smokingLabels[client.smokingStatus || ""]} />
                <Field label="Consumo de Álcool" value={alcoholLabels[client.alcoholConsumption || ""]} />
                <Field label="Nível de Atividade" value={activityLabels[client.activityLevel || ""]} />
              </div>
            )}
          </SectionCard>
        );

      case "desporto":
        return (
          <SectionCard title="Historial Desportivo">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditField label="Experiência de Treino" field="trainingExperience" options={[
                  { value: "none", label: "Sem experiência" }, { value: "beginner", label: "Iniciante" },
                  { value: "intermediate", label: "Intermédio" }, { value: "advanced", label: "Avançado" },
                ]} />
                <EditField label="Treinos / semana" field="trainingFrequency" type="number" />
                <EditField label="Treino Preferido" field="preferredTraining" />
                <EditField label="Desportos Praticados" field="sportHistory" type="textarea" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Experiência" value={expLabels[client.trainingExperience || ""]} />
                <Field label="Frequência" value={client.trainingFrequency} suffix="x/semana" />
                <Field label="Treino Preferido" value={client.preferredTraining} />
                <Field label="Desportos Praticados" value={client.sportHistory} />
              </div>
            )}
          </SectionCard>
        );

      case "objetivos":
        return (
          <SectionCard title="Objetivos">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditField label="Objetivo Principal" field="primaryGoal" options={[
                  { value: "weight_loss", label: "Perder Peso" }, { value: "muscle_gain", label: "Ganhar Músculo" },
                  { value: "maintenance", label: "Manutenção" }, { value: "performance", label: "Performance" },
                  { value: "health", label: "Saúde Geral" }, { value: "rehabilitation", label: "Reabilitação" },
                ]} />
                <EditField label="Objetivo Secundário" field="secondaryGoal" />
                <EditField label="Peso Alvo (kg)" field="targetWeight" type="number" />
                <EditField label="Motivação" field="motivation" type="textarea" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Objetivo Principal" value={goalLabels[client.primaryGoal || ""]} />
                <Field label="Objetivo Secundário" value={client.secondaryGoal} />
                <Field label="Peso Alvo" value={client.targetWeight} suffix=" kg" />
                <Field label="Motivação" value={client.motivation} />
              </div>
            )}
          </SectionCard>
        );

      case "nutricao":
        return (
          <SectionCard title="Nutrição">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditField label="Restrições Alimentares" field="dietaryRestrictions" type="textarea" />
                <EditField label="Alergias Alimentares" field="foodAllergies" type="textarea" />
                <EditField label="Refeições / dia" field="mealsPerDay" type="number" />
                <EditField label="Água (L / dia)" field="waterIntake" type="number" />
                <EditField label="Suplementos" field="supplementsUsed" type="textarea" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Restrições Alimentares" value={client.dietaryRestrictions} />
                <Field label="Alergias Alimentares" value={client.foodAllergies} />
                <Field label="Refeições / dia" value={client.mealsPerDay} />
                <Field label="Água / dia" value={client.waterIntake} suffix=" L" />
                <Field label="Suplementos" value={client.supplementsUsed} />
              </div>
            )}
          </SectionCard>
        );

      case "avaliacoes":
        return (
          <div className="space-y-6">
            <SectionCard title="Avaliações Físicas">
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowAssessment(true)} className="btn-primary text-xs py-1.5 px-3">
                  <Plus className="w-3.5 h-3.5" /> Nova Avaliação
                </button>
              </div>
              {client.bodyAssessments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhuma avaliação registada</p>
              ) : (
                <div className="space-y-3">
                  {client.bodyAssessments.map((a) => {
                    const photos: {url: string; label: string}[] = a.photos ? JSON.parse(a.photos) : [];
                    const isExpanded = expandedAssessment === a.id;
                    return (
                      <div key={a.id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                        <button onClick={() => setExpandedAssessment(isExpanded ? null : a.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                          <div className="flex items-center gap-4">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Date(a.date).toLocaleDateString("pt-PT")}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {a.weight && <span>{a.weight}kg</span>}
                              {a.bodyFat && <span>{a.bodyFat}%</span>}
                              {a.bmi && <span>IMC {a.bmi}</span>}
                              {photos.length > 0 && <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{photos.length}</span>}
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                              {[
                                { label: "Peso", value: a.weight, unit: "kg" },
                                { label: "% Gordura", value: a.bodyFat, unit: "%" },
                                { label: "Massa Musc.", value: a.muscleMass, unit: "kg" },
                                { label: "IMC", value: a.bmi, unit: "" },
                                { label: "TMB", value: a.bmr, unit: "kcal" },
                                { label: "% Água", value: a.waterPct, unit: "%" },
                                { label: "Gord. Visceral", value: a.visceralFat, unit: "" },
                                { label: "Massa Óssea", value: a.boneMass, unit: "kg" },
                                { label: "Idade Metab.", value: a.metabolicAge, unit: "" },
                                { label: "Peito", value: a.chest, unit: "cm" },
                                { label: "Ombros", value: a.shoulders, unit: "cm" },
                                { label: "Cintura", value: a.waist, unit: "cm" },
                                { label: "Abdómen", value: a.abdomen, unit: "cm" },
                                { label: "Anca", value: a.hips, unit: "cm" },
                                { label: "Braços", value: a.arms, unit: "cm" },
                                { label: "Coxas", value: a.thighs, unit: "cm" },
                                { label: "Gémeos", value: a.calves, unit: "cm" },
                                { label: "Pescoço", value: a.neck, unit: "cm" },
                              ].filter(m => m.value != null).map(m => (
                                <div key={m.label} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700 text-center">
                                  <p className="text-xs text-gray-400 dark:text-gray-500">{m.label}</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.value}{m.unit}</p>
                                </div>
                              ))}
                            </div>
                            {photos.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fotografias</p>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                  {photos.map((p, i) => (
                                    <div key={i} className="relative group cursor-pointer" onClick={() => setSelectedGalleryAssessment(p.url)}>
                                      <img src={p.url} alt={photoLabelMap[p.label] || p.label} className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                                      <p className="text-[10px] text-gray-500 mt-0.5 text-center">{photoLabelMap[p.label] || p.label}</p>
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {a.notes && <p className="text-sm text-gray-600 dark:text-gray-400 italic">{a.notes}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Photo Evolution - Compare across assessments */}
            {client.bodyAssessments.filter(a => a.photos).length >= 2 && (
              <SectionCard title="Evolução Fotográfica">
                <div className="space-y-4">
                  {PHOTO_LABELS.map(({ value, label }) => {
                    const timeline = client.bodyAssessments
                      .map(a => ({ date: a.date, photos: a.photos ? JSON.parse(a.photos) as {url: string; label: string}[] : [] }))
                      .filter(a => a.photos.some(p => p.label === value))
                      .map(a => ({ date: a.date, url: a.photos.find(p => p.label === value)!.url }));
                    if (timeline.length < 2) return null;
                    return (
                      <div key={value}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {timeline.map((t, i) => (
                            <div key={i} className="flex-shrink-0 cursor-pointer" onClick={() => setSelectedGalleryAssessment(t.url)}>
                              <img src={t.url} alt={label} className="w-24 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                              <p className="text-[10px] text-gray-400 text-center mt-1">{new Date(t.date).toLocaleDateString("pt-PT")}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </SectionCard>
            )}

            {/* Lightbox */}
            {selectedGalleryAssessment && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedGalleryAssessment(null)}>
                <img src={selectedGalleryAssessment} alt="Foto" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
                <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70" onClick={() => setSelectedGalleryAssessment(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        );

      case "ferramentas": {
        const imc = calcIMC();
        const tmb = calcTMB();
        const tdee = calcTDEE();
        const water = calcWater();
        const macros = calcMacros();
        const imcCat = imc ? imcCategory(imc) : null;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* IMC */}
              <div className={`rounded-2xl p-5 border ${imcCat ? imcCat.bg : "bg-gray-50 dark:bg-gray-800"} border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">IMC</span>
                </div>
                {imc ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{imc}</p>
                    <p className={`text-sm font-medium ${imcCat?.color}`}>{imcCat?.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{client.weight}kg / {client.height}cm</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Peso e altura necessários</p>
                )}
              </div>

              {/* TMB */}
              <div className="rounded-2xl p-5 border bg-orange-50 dark:bg-orange-900/20 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">TMB</span>
                </div>
                {tmb ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{tmb}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">kcal/dia (repouso)</p>
                    <p className="text-xs text-gray-400 mt-1">Mifflin-St Jeor</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Peso, altura, idade e género necessários</p>
                )}
              </div>

              {/* TDEE */}
              <div className="rounded-2xl p-5 border bg-purple-50 dark:bg-purple-900/20 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">TDEE</span>
                </div>
                {tdee ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{tdee}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">kcal/dia (atividade)</p>
                    <p className="text-xs text-gray-400 mt-1">{activityMultipliers[client.activityLevel || ""]?.label || ""}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">TMB + nível de atividade necessários</p>
                )}
              </div>

              {/* Água */}
              <div className="rounded-2xl p-5 border bg-cyan-50 dark:bg-cyan-900/20 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="w-5 h-5 text-cyan-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Água Diária</span>
                </div>
                {water ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{water}L</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">recomendado/dia</p>
                    <p className="text-xs text-gray-400 mt-1">~35ml × {client.weight}kg</p>
                    {client.waterIntake && (
                      <p className={`text-xs mt-1 font-medium ${client.waterIntake >= water ? "text-emerald-600" : "text-amber-600"}`}>
                        Atual: {client.waterIntake}L {client.waterIntake >= water ? "✓" : "↑"}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Peso necessário</p>
                )}
              </div>
            </div>

            {/* Macros Calculator */}
            {macros && (
              <SectionCard title="Macronutrientes Recomendados">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">
                    Baseado no TDEE ({tdee} kcal) e objetivo: <strong>{goalLabels[client.primaryGoal || ""] || client.primaryGoal}</strong>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{macros.calories} kcal/dia</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
                    <p className="text-2xl font-bold text-red-600">{macros.protein}g</p>
                    <p className="text-xs text-gray-500 mt-1">Proteína</p>
                    <p className="text-xs text-gray-400">{macros.protein * 4} kcal ({Math.round(macros.protein * 4 / macros.calories * 100)}%)</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                    <p className="text-2xl font-bold text-amber-600">{macros.carbs}g</p>
                    <p className="text-xs text-gray-500 mt-1">Hidratos</p>
                    <p className="text-xs text-gray-400">{macros.carbs * 4} kcal ({Math.round(macros.carbs * 4 / macros.calories * 100)}%)</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                    <p className="text-2xl font-bold text-blue-600">{macros.fat}g</p>
                    <p className="text-xs text-gray-500 mt-1">Gordura</p>
                    <p className="text-xs text-gray-400">{macros.fat * 9} kcal ({Math.round(macros.fat * 9 / macros.calories * 100)}%)</p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Body Fat Categories Info */}
            <SectionCard title="Referência — Percentagem de Gordura Corporal">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                {[
                  { range: client.gender === "female" ? "10-13%" : "2-5%", label: "Essencial", color: "bg-blue-50 text-blue-700" },
                  { range: client.gender === "female" ? "14-20%" : "6-13%", label: "Atleta", color: "bg-emerald-50 text-emerald-700" },
                  { range: client.gender === "female" ? "21-24%" : "14-17%", label: "Fitness", color: "bg-green-50 text-green-700" },
                  { range: client.gender === "female" ? "25-31%" : "18-24%", label: "Média", color: "bg-yellow-50 text-yellow-700" },
                  { range: client.gender === "female" ? "32%+" : "25%+", label: "Acima", color: "bg-red-50 text-red-700" },
                ].map(c => (
                  <div key={c.label} className={`${c.color} rounded-lg p-3`}>
                    <p className="text-xs font-medium">{c.label}</p>
                    <p className="text-sm font-bold">{c.range}</p>
                  </div>
                ))}
              </div>
              {client.bodyFat && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 text-center">Atual: <strong>{client.bodyFat}%</strong> gordura corporal</p>
              )}
            </SectionCard>
          </div>
        );
      }

      case "checkins":
        return (
          <SectionCard title="Check-ins Diários">
            {!client.checkIns || client.checkIns.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum check-in registado</p>
            ) : (
              <div className="space-y-3">
                {client.checkIns.map((ci) => {
                  const moodEmoji = ci.mood ? ["", "😞", "😕", "😐", "🙂", "😄"][ci.mood] : "";
                  const energyEmoji = ci.energy ? ["", "🔋", "🔋🔋", "⚡", "⚡⚡", "🚀"][ci.energy] : "";
                  return (
                    <div key={ci.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {new Date(ci.date).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <div className="flex gap-2">
                          {ci.trainedToday && (
                            <span className="badge bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs">Treinou</span>
                          )}
                          {ci.followedDiet && (
                            <span className="badge bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">Dieta OK</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Humor</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{moodEmoji} {ci.mood ? `${ci.mood}/5` : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Energia</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{energyEmoji} {ci.energy ? `${ci.energy}/5` : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Sono</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{ci.sleep ? `${ci.sleep}/5` : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Dor Muscular</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{ci.soreness ? `${ci.soreness}/5` : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Stress</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{ci.stress ? `${ci.stress}/5` : "—"}</p>
                        </div>
                      </div>
                      {(ci.weight || ci.waterLiters) && (
                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          {ci.weight && <p className="text-xs text-gray-500 dark:text-gray-400">Peso: <span className="font-medium text-gray-700 dark:text-gray-300">{ci.weight}kg</span></p>}
                          {ci.waterLiters && <p className="text-xs text-gray-500 dark:text-gray-400">Água: <span className="font-medium text-gray-700 dark:text-gray-300">{ci.waterLiters}L</span></p>}
                        </div>
                      )}
                      {ci.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic">&quot;{ci.notes}&quot;</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        );

      case "planos":
        return (
          <div className="space-y-6">
            <SectionCard title="Planos de Treino">
              {client.trainingPlans.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum plano de treino atribuído</p>
              ) : (
                <div className="space-y-2">
                  {client.trainingPlans.map((tp) => (
                    <div key={tp.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tp.trainingPlan.name}</span>
                      </div>
                      <span className={`badge ${tp.isActive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                        {tp.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
            <SectionCard title="Planos de Nutrição">
              {client.nutritionPlans.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum plano nutricional atribuído</p>
              ) : (
                <div className="space-y-2">
                  {client.nutritionPlans.map((np) => (
                    <div key={np.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{np.nutritionPlan.name}</span>
                      </div>
                      <span className={`badge ${np.isActive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                        {np.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
            <SectionCard title="Feedbacks">
              {client.feedbacks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum feedback registado</p>
              ) : (
                <div className="space-y-3">
                  {client.feedbacks.map((fb) => (
                    <div key={fb.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{fb.subject}</p>
                        <span className={`badge ${fb.status === "pending" ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}`}>
                          {fb.status === "pending" ? "Pendente" : "Resolvido"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{fb.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(fb.createdAt).toLocaleDateString("pt-PT")}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        );

      case "diario":
        return <FoodLogTab clientId={client.id} />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push("/clients")} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg font-semibold">
              {client.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Anamnese — Cliente desde {new Date(client.createdAt).toLocaleDateString("pt-PT")}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="btn-secondary"><X className="w-4 h-4" /> Cancelar</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" /> {saving ? "A guardar..." : "Guardar"}
              </button>
            </>
          ) : (
            <>
              <button onClick={startEdit} className="btn-secondary"><Edit className="w-4 h-4" /> Editar</button>
              <button onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); }} className="btn-danger"><Trash2 className="w-4 h-4" /> Eliminar</button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              tab === key ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTab()}

      {/* Assessment Modal */}
      <Modal isOpen={showAssessment} onClose={() => setShowAssessment(false)} title="Nova Avaliação Física" size="xl">
        <form onSubmit={handleAddAssessment} className="space-y-5">
          {/* Composição Corporal */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Composição Corporal</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Peso (kg)", field: "weight" },
                { label: "% Gordura", field: "bodyFat" },
                { label: "Massa Muscular (kg)", field: "muscleMass" },
                { label: "% Água", field: "waterPct" },
                { label: "Gord. Visceral", field: "visceralFat" },
                { label: "Massa Óssea (kg)", field: "boneMass" },
                { label: "Idade Metabólica", field: "metabolicAge" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input type="number" step="0.1" value={(assessmentForm as Record<string, string>)[field]} onChange={(e) => setAssessmentForm({ ...assessmentForm, [field]: e.target.value })} className="input-field" />
                </div>
              ))}
            </div>
          </div>

          {/* Medidas */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Medidas Corporais (cm)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Peito", field: "chest" },
                { label: "Ombros", field: "shoulders" },
                { label: "Cintura", field: "waist" },
                { label: "Abdómen", field: "abdomen" },
                { label: "Anca", field: "hips" },
                { label: "Braços", field: "arms" },
                { label: "Coxas", field: "thighs" },
                { label: "Gémeos", field: "calves" },
                { label: "Pescoço", field: "neck" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input type="number" step="0.1" value={(assessmentForm as Record<string, string>)[field]} onChange={(e) => setAssessmentForm({ ...assessmentForm, [field]: e.target.value })} className="input-field" />
                </div>
              ))}
            </div>
          </div>

          {/* Fotografias */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              <Camera className="w-3.5 h-3.5 inline mr-1" />Fotografias do Corpo
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {PHOTO_LABELS.map(({ value, label }) => {
                const existing = assessmentPhotos.find(p => p.label === value);
                return (
                  <div key={value} className="text-center">
                    {existing ? (
                      <div className="relative group">
                        <img src={existing.url} alt={label} className="w-full h-20 object-cover rounded-lg border border-emerald-200" />
                        <button type="button" onClick={() => setAssessmentPhotos(prev => prev.filter(p => p.label !== value))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition">
                        {uploadingPhoto ? (
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-gray-400" />
                            <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadPhoto(f, value); }} />
                      </label>
                    )}
                    <p className="text-[10px] text-gray-500 mt-1">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Notas</label>
            <textarea value={assessmentForm.notes} onChange={(e) => setAssessmentForm({ ...assessmentForm, notes: e.target.value })} className="input-field min-h-[60px]" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAssessment(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Avaliação</button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ───────────────────── */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }} title="Eliminar Cliente" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">
              <p className="font-semibold mb-1">Esta ação é irreversível!</p>
              <p>Ao eliminar <strong>{client?.name}</strong>, todos os dados serão permanentemente apagados:</p>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }} className="btn-secondary flex-1 justify-center">Cancelar</button>
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
