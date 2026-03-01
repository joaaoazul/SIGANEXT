"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Scale,
  Heart,
  Zap,
  Moon,
  Flame,
  Brain,
  Droplets,
  CheckCircle2,
  Send,
  Ruler,
  Camera,
} from "lucide-react";

interface CheckIn {
  id: string;
  date: string;
  mood: number | null;
  energy: number | null;
  sleep: number | null;
  soreness: number | null;
  stress: number | null;
  trainedToday: boolean;
  followedDiet: boolean;
  waterLiters: number | null;
  weight: number | null;
  notes: string | null;
}

interface BodyPhoto {
  url: string;
  label: string;
  path: string;
}

interface BodyAssessment {
  id: string;
  date: string;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  arms: number | null;
  thighs: number | null;
  calves: number | null;
  shoulders: number | null;
  neck: number | null;
  abdomen: number | null;
  notes: string | null;
  photos: string | null;
}

interface ProgressData {
  client: {
    weight: number | null;
    targetWeight: number | null;
    bodyFat: number | null;
    height: number | null;
  };
  checkIns: CheckIn[];
  bodyAssessments: BodyAssessment[];
}

const moodLabels = ["", "Muito mau", "Mau", "Normal", "Bom", "Excelente"];
const moodEmojis = ["", "😞", "😐", "🙂", "😊", "🤩"];
const energyEmojis = ["", "🪫", "🔋", "⚡", "💪", "🔥"];

export default function AthleteProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"checkin" | "history" | "body">("checkin");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    mood: 0,
    energy: 0,
    sleep: 0,
    soreness: 0,
    stress: 0,
    trainedToday: false,
    followedDiet: false,
    waterLiters: "",
    weight: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/athlete/progress")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        setData(d);
        // Pre-fill with today's check-in if it exists
        const today = new Date().toISOString().split("T")[0];
        const todayCheckIn = d.checkIns?.find(
          (c: CheckIn) => c.date.split("T")[0] === today
        );
        if (todayCheckIn) {
          setForm({
            mood: todayCheckIn.mood || 0,
            energy: todayCheckIn.energy || 0,
            sleep: todayCheckIn.sleep || 0,
            soreness: todayCheckIn.soreness || 0,
            stress: todayCheckIn.stress || 0,
            trainedToday: todayCheckIn.trainedToday,
            followedDiet: todayCheckIn.followedDiet,
            waterLiters: todayCheckIn.waterLiters?.toString() || "",
            weight: todayCheckIn.weight?.toString() || "",
            notes: todayCheckIn.notes || "",
          });
          setSubmitted(true);
        }
      })
      .catch((err) => console.error("Progress fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/athlete/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: form.mood || null,
          energy: form.energy || null,
          sleep: form.sleep || null,
          soreness: form.soreness || null,
          stress: form.stress || null,
          trainedToday: form.trainedToday,
          followedDiet: form.followedDiet,
          waterLiters: form.waterLiters ? parseFloat(form.waterLiters) : null,
          weight: form.weight ? parseFloat(form.weight) : null,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        // Refresh data
        const fresh = await fetch("/api/athlete/progress").then((r) => r.json());
        setData(fresh);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Progresso</h1>
        <p className="text-gray-500 mt-1">Acompanha a tua evolução diária</p>
      </div>

      {/* Weight Overview */}
      {data?.client && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Scale className="w-5 h-5" />} label="Peso Atual" value={data.client.weight ? `${data.client.weight} kg` : "—"} color="emerald" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Peso Alvo" value={data.client.targetWeight ? `${data.client.targetWeight} kg` : "—"} color="blue" />
          <StatCard icon={<Ruler className="w-5 h-5" />} label="Altura" value={data.client.height ? `${data.client.height} cm` : "—"} color="purple" />
          <StatCard icon={<Flame className="w-5 h-5" />} label="% Gordura" value={data.client.bodyFat ? `${data.client.bodyFat}%` : "—"} color="amber" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        {[
          { key: "checkin", label: "Check-in Diário" },
          { key: "history", label: "Histórico" },
          { key: "body", label: "Avaliações Corporais" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Check-in Form */}
      {tab === "checkin" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-6">
          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-700">
                Check-in de hoje registado! Podes atualizar os valores abaixo.
              </p>
            </div>
          )}

          {/* Wellness Metrics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Como te sentes hoje?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <ScaleSelector
                label="Humor"
                icon={<Heart className="w-4 h-4" />}
                value={form.mood}
                onChange={(v) => setForm({ ...form, mood: v })}
                emojis={moodEmojis}
                labels={moodLabels}
              />
              <ScaleSelector
                label="Energia"
                icon={<Zap className="w-4 h-4" />}
                value={form.energy}
                onChange={(v) => setForm({ ...form, energy: v })}
                emojis={energyEmojis}
              />
              <ScaleSelector
                label="Qualidade Sono"
                icon={<Moon className="w-4 h-4" />}
                value={form.sleep}
                onChange={(v) => setForm({ ...form, sleep: v })}
              />
              <ScaleSelector
                label="Dor Muscular"
                icon={<Flame className="w-4 h-4" />}
                value={form.soreness}
                onChange={(v) => setForm({ ...form, soreness: v })}
              />
              <ScaleSelector
                label="Stress"
                icon={<Brain className="w-4 h-4" />}
                value={form.stress}
                onChange={(v) => setForm({ ...form, stress: v })}
              />
            </div>
          </div>

          {/* Compliance */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Atividades</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setForm({ ...form, trainedToday: !form.trainedToday })}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition text-sm font-medium ${
                  form.trainedToday
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {form.trainedToday ? "✅" : "🏋️"} Treinei hoje
              </button>
              <button
                onClick={() => setForm({ ...form, followedDiet: !form.followedDiet })}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition text-sm font-medium ${
                  form.followedDiet
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {form.followedDiet ? "✅" : "🥗"} Cumpri a dieta
              </button>
            </div>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Droplets className="w-4 h-4 inline mr-1" />
                Água (litros)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.waterLiters}
                onChange={(e) => setForm({ ...form, waterLiters: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ex: 2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Scale className="w-4 h-4 inline mr-1" />
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ex: 75.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                📝 Notas
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Como correu o dia..."
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            <Send className="w-4 h-4" />
            {submitting ? "A enviar..." : submitted ? "Atualizar Check-in" : "Enviar Check-in"}
          </button>
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="space-y-3">
          {data?.checkIns && data.checkIns.length > 0 ? (
            data.checkIns.map((ci) => (
              <div
                key={ci.id}
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900">
                    {new Date(ci.date).toLocaleDateString("pt-PT", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  {ci.weight && (
                    <span className="text-sm text-gray-500">{ci.weight} kg</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {ci.mood && (
                    <span className="text-sm bg-pink-50 text-pink-600 px-3 py-1 rounded-full">
                      {moodEmojis[ci.mood]} Humor: {ci.mood}/5
                    </span>
                  )}
                  {ci.energy && (
                    <span className="text-sm bg-amber-50 text-amber-600 px-3 py-1 rounded-full">
                      {energyEmojis[ci.energy]} Energia: {ci.energy}/5
                    </span>
                  )}
                  {ci.sleep && (
                    <span className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                      🌙 Sono: {ci.sleep}/5
                    </span>
                  )}
                  {ci.trainedToday && (
                    <span className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                      ✅ Treinou
                    </span>
                  )}
                  {ci.followedDiet && (
                    <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                      ✅ Dieta
                    </span>
                  )}
                  {ci.waterLiters && (
                    <span className="text-sm bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full">
                      💧 {ci.waterLiters}L
                    </span>
                  )}
                </div>
                {ci.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">{ci.notes}</p>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Ainda não tens check-ins registados.</p>
            </div>
          )}
        </div>
      )}

      {/* Body Assessments Tab */}
      {tab === "body" && (
        <div className="space-y-6">
          {/* Body Part Photo Placeholders */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-500" />
              Fotos de Progresso
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              O teu PT irá registar fotos de cada parte do corpo para acompanhar a tua evolução.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { key: "frente", label: "Frente", emoji: "🧍" },
                { key: "costas", label: "Costas", emoji: "🔙" },
                { key: "lateral_esq", label: "Lateral Esq.", emoji: "◀️" },
                { key: "lateral_dir", label: "Lateral Dir.", emoji: "▶️" },
                { key: "peito", label: "Peito", emoji: "💪" },
                { key: "abdomen", label: "Abdómen", emoji: "🫁" },
                { key: "braco_esq", label: "Braço Esq.", emoji: "💪" },
                { key: "braco_dir", label: "Braço Dir.", emoji: "💪" },
                { key: "coxa_esq", label: "Coxa Esq.", emoji: "🦵" },
                { key: "coxa_dir", label: "Coxa Dir.", emoji: "🦵" },
                { key: "gemeo", label: "Gémeos", emoji: "🦿" },
                { key: "ombros", label: "Ombros", emoji: "🤷" },
              ].map((part) => {
                // Try to find a photo for this body part from the latest assessment
                const latestAssessment = data?.bodyAssessments?.[0];
                let photoUrl: string | null = null;
                if (latestAssessment?.photos) {
                  try {
                    const photos: BodyPhoto[] = JSON.parse(latestAssessment.photos);
                    const found = photos.find((p) => p.path === part.key);
                    if (found) photoUrl = found.url;
                  } catch { /* ignore */ }
                }

                return (
                  <div
                    key={part.key}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors relative overflow-hidden"
                  >
                    {photoUrl ? (
                      <>
                        <img src={photoUrl} alt={part.label} className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-xs font-medium text-white text-center">{part.label}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">{part.emoji}</span>
                        <p className="text-xs font-medium text-gray-400">{part.label}</p>
                        <Camera className="w-3.5 h-3.5 text-gray-300" />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessment History */}
          {data?.bodyAssessments && data.bodyAssessments.length > 0 ? (
            data.bodyAssessments.map((ba) => (
              <div
                key={ba.id}
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <p className="font-semibold text-gray-900 mb-3">
                  {new Date(ba.date).toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {/* Photos grid for this assessment */}
                {ba.photos && (() => {
                  try {
                    const photos: BodyPhoto[] = JSON.parse(ba.photos);
                    if (photos.length > 0) {
                      return (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                          {photos.map((photo, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden relative">
                              <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                                <p className="text-[10px] font-medium text-white text-center">{photo.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  } catch { /* ignore */ }
                  return null;
                })()}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ba.weight && <MeasureBadge label="Peso" value={`${ba.weight} kg`} />}
                  {ba.bodyFat && <MeasureBadge label="% Gordura" value={`${ba.bodyFat}%`} />}
                  {ba.muscleMass && <MeasureBadge label="Massa Muscular" value={`${ba.muscleMass} kg`} />}
                  {ba.chest && <MeasureBadge label="Peito" value={`${ba.chest} cm`} />}
                  {ba.waist && <MeasureBadge label="Cintura" value={`${ba.waist} cm`} />}
                  {ba.hips && <MeasureBadge label="Anca" value={`${ba.hips} cm`} />}
                  {ba.arms && <MeasureBadge label="Braços" value={`${ba.arms} cm`} />}
                  {ba.thighs && <MeasureBadge label="Coxas" value={`${ba.thighs} cm`} />}
                  {ba.calves && <MeasureBadge label="Gémeos" value={`${ba.calves} cm`} />}
                  {ba.shoulders && <MeasureBadge label="Ombros" value={`${ba.shoulders} cm`} />}
                  {ba.neck && <MeasureBadge label="Pescoço" value={`${ba.neck} cm`} />}
                  {ba.abdomen && <MeasureBadge label="Abdómen" value={`${ba.abdomen} cm`} />}
                </div>
                {ba.notes && (
                  <p className="text-sm text-gray-500 mt-3 italic">{ba.notes}</p>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Sem avaliações corporais registadas.</p>
              <p className="text-sm text-gray-400 mt-1">O teu PT irá registar as tuas avaliações.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function ScaleSelector({
  label,
  icon,
  value,
  onChange,
  emojis,
  labels,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  emojis?: string[];
  labels?: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
        {icon} {label}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(value === n ? 0 : n)}
            className={`flex-1 h-10 rounded-lg text-sm font-medium transition ${
              value === n
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            title={labels?.[n]}
          >
            {emojis ? emojis[n] : n}
          </button>
        ))}
      </div>
    </div>
  );
}

function MeasureBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
