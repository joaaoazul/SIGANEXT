"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Edit, Trash2, Save, X, Mail, Phone, Calendar, Ruler, Weight,
  Activity, Dumbbell, UtensilsCrossed, MessageSquare, Plus, Heart,
  Target, Utensils, User, Briefcase,
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
  }[];
}

type TabKey = "resumo" | "medico" | "lifestyle" | "desporto" | "objetivos" | "nutricao" | "avaliacoes" | "planos";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "resumo", label: "Resumo", icon: User },
  { key: "medico", label: "Médico", icon: Heart },
  { key: "lifestyle", label: "Estilo de Vida", icon: Briefcase },
  { key: "desporto", label: "Desporto", icon: Dumbbell },
  { key: "objetivos", label: "Objetivos", icon: Target },
  { key: "nutricao", label: "Nutrição", icon: Utensils },
  { key: "avaliacoes", label: "Avaliações", icon: Activity },
  { key: "planos", label: "Planos", icon: UtensilsCrossed },
];

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
    weight: "", bodyFat: "", muscleMass: "", chest: "", waist: "", hips: "", arms: "", thighs: "", notes: "",
  });

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

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/clients/${params.id}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentForm),
    });
    if (res.ok) {
      setShowAssessment(false);
      setAssessmentForm({ weight: "", bodyFat: "", muscleMass: "", chest: "", waist: "", hips: "", arms: "", thighs: "", notes: "" });
      fetchClient();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tens a certeza que queres eliminar este cliente?")) return;
    await fetch(`/api/clients/${params.id}`, { method: "DELETE" });
    router.push("/clients");
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
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value != null && value !== "" ? `${value}${suffix || ""}` : "—"}</p>
    </div>
  );

  const EditField = ({ label, field, type = "text", options }: {
    label: string; field: string; type?: string; options?: { value: string; label: string }[];
  }) => {
    if (options) {
      return (
        <div>
          <label className="block text-xs text-gray-500 mb-1">{label}</label>
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
          <label className="block text-xs text-gray-500 mb-1">{label}</label>
          <textarea value={editData[field] || ""} onChange={(e) => setEditData({ ...editData, [field]: e.target.value })} rows={2} className="input-field text-sm resize-none" />
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <input type={type} value={editData[field] ?? ""} onChange={(e) => setEditData({ ...editData, [field]: e.target.value })} className="input-field text-sm" />
      </div>
    );
  };

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
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
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{client.email}</span></div>
                    {client.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{client.phone}</span></div>}
                    {client.dateOfBirth && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{new Date(client.dateOfBirth).toLocaleDateString("pt-PT")}</span></div>}
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{client.gender === "male" ? "Masculino" : client.gender === "female" ? "Feminino" : client.gender || "—"}</span></div>
                    <div className="pt-2 flex gap-2">
                      <span className={`badge ${client.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
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
                      <p className="text-lg font-semibold text-gray-900">{client.height || "—"}</p>
                      <p className="text-xs text-gray-400">cm</p>
                    </div>
                    <div>
                      <Weight className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-900">{client.weight || "—"}</p>
                      <p className="text-xs text-gray-400">kg</p>
                    </div>
                    <div>
                      <Activity className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-900">{client.bodyFat || "—"}</p>
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
                      <span className="text-sm text-gray-600">{tp.trainingPlan.name}</span>
                    </div>
                  ))}
                  {client.nutritionPlans.filter(np => np.isActive).map((np) => (
                    <div key={np.id} className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm text-gray-600">{np.nutritionPlan.name}</span>
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
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-rose-500" /><span className="text-xs font-semibold text-rose-700 uppercase">Médico</span></div>
                <p className="text-sm text-gray-600 line-clamp-2">{client.medicalConditions || "Sem condições registadas"}</p>
                {client.injuries && <p className="text-xs text-rose-600 mt-1">Lesões: {client.injuries}</p>}
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2"><Briefcase className="w-4 h-4 text-blue-500" /><span className="text-xs font-semibold text-blue-700 uppercase">Estilo de Vida</span></div>
                <p className="text-sm text-gray-600">{client.occupation || "—"}</p>
                <p className="text-xs text-blue-600 mt-1">{activityLabels[client.activityLevel || ""] || "Nível de atividade não definido"}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-purple-500" /><span className="text-xs font-semibold text-purple-700 uppercase">Objetivo</span></div>
                <p className="text-sm text-gray-600">{goalLabels[client.primaryGoal || ""] || "Não definido"}</p>
                {client.targetWeight && <p className="text-xs text-purple-600 mt-1">Peso alvo: {client.targetWeight}kg</p>}
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2"><Dumbbell className="w-4 h-4 text-amber-500" /><span className="text-xs font-semibold text-amber-700 uppercase">Desporto</span></div>
                <p className="text-sm text-gray-600">{expLabels[client.trainingExperience || ""] || "Não definido"}</p>
                {client.trainingFrequency && <p className="text-xs text-amber-600 mt-1">{client.trainingFrequency}x/semana</p>}
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <SectionCard title="Notas">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
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
                <EditField label="Freq. Cardíaca (BPM)" field="heartRate" type="number" />
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
          <SectionCard title="Avaliações Físicas">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowAssessment(true)} className="btn-primary text-xs py-1.5 px-3">
                <Plus className="w-3.5 h-3.5" /> Nova Avaliação
              </button>
            </div>
            {client.bodyAssessments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma avaliação registada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase">
                      <th className="text-left py-2 px-3">Data</th>
                      <th className="text-left py-2 px-3">Peso</th>
                      <th className="text-left py-2 px-3">% Gordura</th>
                      <th className="text-left py-2 px-3">Massa Muscular</th>
                      <th className="text-left py-2 px-3">Peito</th>
                      <th className="text-left py-2 px-3">Cintura</th>
                      <th className="text-left py-2 px-3">Anca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.bodyAssessments.map((a) => (
                      <tr key={a.id} className="border-t border-gray-100">
                        <td className="py-2 px-3 text-gray-600">{new Date(a.date).toLocaleDateString("pt-PT")}</td>
                        <td className="py-2 px-3 text-gray-600">{a.weight ? `${a.weight}kg` : "—"}</td>
                        <td className="py-2 px-3 text-gray-600">{a.bodyFat ? `${a.bodyFat}%` : "—"}</td>
                        <td className="py-2 px-3 text-gray-600">{a.muscleMass ? `${a.muscleMass}kg` : "—"}</td>
                        <td className="py-2 px-3 text-gray-600">{a.chest ? `${a.chest}cm` : "—"}</td>
                        <td className="py-2 px-3 text-gray-600">{a.waist ? `${a.waist}cm` : "—"}</td>
                        <td className="py-2 px-3 text-gray-600">{a.hips ? `${a.hips}cm` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <div key={tp.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-700">{tp.trainingPlan.name}</span>
                      </div>
                      <span className={`badge ${tp.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
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
                    <div key={np.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm text-gray-700">{np.nutritionPlan.name}</span>
                      </div>
                      <span className={`badge ${np.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
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
                    <div key={fb.id} className="p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{fb.subject}</p>
                        <span className={`badge ${fb.status === "pending" ? "bg-yellow-50 text-yellow-600" : "bg-emerald-50 text-emerald-600"}`}>
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
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push("/clients")} className="p-2 hover:bg-white rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg font-semibold">
              {client.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-500 text-sm">Anamnese — Cliente desde {new Date(client.createdAt).toLocaleDateString("pt-PT")}</p>
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
              <button onClick={handleDelete} className="btn-danger"><Trash2 className="w-4 h-4" /> Eliminar</button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTab()}

      {/* Assessment Modal */}
      <Modal isOpen={showAssessment} onClose={() => setShowAssessment(false)} title="Nova Avaliação Física" size="lg">
        <form onSubmit={handleAddAssessment} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Peso (kg)", field: "weight" },
              { label: "% Gordura", field: "bodyFat" },
              { label: "Massa Muscular (kg)", field: "muscleMass" },
              { label: "Peito (cm)", field: "chest" },
              { label: "Cintura (cm)", field: "waist" },
              { label: "Anca (cm)", field: "hips" },
              { label: "Braços (cm)", field: "arms" },
              { label: "Coxas (cm)", field: "thighs" },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-sm text-gray-500 mb-1">{label}</label>
                <input
                  type="number"
                  step="0.1"
                  value={(assessmentForm as Record<string, string>)[field]}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, [field]: e.target.value })}
                  className="input-field"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Notas</label>
            <textarea value={assessmentForm.notes} onChange={(e) => setAssessmentForm({ ...assessmentForm, notes: e.target.value })} className="input-field min-h-[60px]" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAssessment(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
