"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Heart, Zap, Moon, Flame, Brain, Droplets, Weight, Calendar, ChevronDown, User, Camera, Upload, X, Eye } from "lucide-react";

interface CheckIn {
  id: string;
  clientId: string;
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
  photos: string | null;
  client: { id: string; name: string; avatar: string | null };
}

interface ClientOption {
  id: string;
  name: string;
}

const moodLabels = ["", "Péssimo", "Mau", "Normal", "Bom", "Excelente"];
const moodColors = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-lime-500", "text-emerald-500"];
const moodBgs = ["", "bg-red-50", "bg-orange-50", "bg-yellow-50", "bg-lime-50", "bg-emerald-50"];

function MetricBadge({ value, icon: Icon, label }: { value: number | null; icon: React.ElementType; label: string }) {
  if (!value) return null;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${moodBgs[value]} ${moodColors[value]}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{label}: {value}/5</span>
    </div>
  );
}

export default function CheckInsPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formClient, setFormClient] = useState("");

  const [form, setForm] = useState({
    mood: 3, energy: 3, sleep: 3, soreness: 3, stress: 3,
    trainedToday: false, followedDiet: false,
    waterLiters: "", weight: "", notes: "",
  });
  const [checkinPhotos, setCheckinPhotos] = useState<{url: string; label: string; path: string}[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCheckins();
    fetchClients();
  }, [selectedClient]);

  const fetchCheckins = async () => {
    setLoading(true);
    const params = selectedClient ? `?clientId=${selectedClient}` : "";
    const res = await fetch(`/api/checkins${params}`);
    if (res.ok) {
      const data = await res.json();
      setCheckins(data.checkins);
    }
    setLoading(false);
  };

  const fetchClients = async () => {
    const res = await fetch("/api/clients");
    if (res.ok) {
      const data = await res.json();
      setClients(data.map((c: ClientOption) => ({ id: c.id, name: c.name })));
    }
  };

  const handleUploadPhoto = async (file: File) => {
    if (!formClient) { alert("Seleciona o atleta primeiro"); return; }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `clients/${formClient}/checkins`);
      formData.append("label", `checkin_${Date.now()}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setCheckinPhotos(prev => [...prev, { url: data.url, label: data.label, path: data.path }]);
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao fazer upload");
      }
    } catch { alert("Erro ao fazer upload"); }
    setUploadingPhoto(false);
  };

  const handleSubmit = async () => {
    if (!formClient) return;
    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: formClient, ...form,
        photos: checkinPhotos.length > 0 ? JSON.stringify(checkinPhotos) : undefined,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setCheckinPhotos([]);
      fetchCheckins();
    }
  };

  // Group check-ins by date
  const grouped = checkins.reduce<Record<string, CheckIn[]>>((acc, ci) => {
    const key = new Date(ci.date).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(ci);
    return acc;
  }, {});

  // Stats
  const todayCheckins = checkins.filter((ci) => {
    const d = new Date(ci.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const avgMood = todayCheckins.length ? (todayCheckins.reduce((s, c) => s + (c.mood || 0), 0) / todayCheckins.filter(c => c.mood).length).toFixed(1) : "-";
  const trained = todayCheckins.filter((c) => c.trainedToday).length;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-ins Hoje</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-500" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayCheckins.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Humor Médio</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Heart className="w-4 h-4 text-purple-500" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgMood}/5</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Treinaram Hoje</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Flame className="w-4 h-4 text-blue-500" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{trained}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Check-ins</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Calendar className="w-4 h-4 text-amber-500" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{checkins.length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="input-field pr-8 text-sm appearance-none">
              <option value="">Todos os atletas</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancelar" : "Novo Check-in"}
        </button>
      </div>

      {/* New Check-in Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Novo Check-in</h3>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Atleta</label>
            <select value={formClient} onChange={(e) => setFormClient(e.target.value)} className="input-field">
              <option value="">Selecionar atleta</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { key: "mood", label: "Humor", icon: Heart },
              { key: "energy", label: "Energia", icon: Zap },
              { key: "sleep", label: "Sono", icon: Moon },
              { key: "soreness", label: "Dor Muscular", icon: Flame },
              { key: "stress", label: "Stress", icon: Brain },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1.5">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} onClick={() => setForm({ ...form, [key]: v })} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${form[key as keyof typeof form] === v ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.trainedToday} onChange={(e) => setForm({ ...form, trainedToday: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700">Treinou hoje</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.followedDiet} onChange={(e) => setForm({ ...form, followedDiet: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700">Seguiu dieta</span>
            </label>
            <div>
              <label className="flex items-center gap-1 text-sm text-gray-600 mb-1"><Droplets className="w-3.5 h-3.5" /> Água (L)</label>
              <input type="number" step="0.1" value={form.waterLiters} onChange={(e) => setForm({ ...form, waterLiters: e.target.value })} placeholder="2.0" className="input-field" />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm text-gray-600 mb-1"><Weight className="w-3.5 h-3.5" /> Peso (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="75.0" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field resize-none" placeholder="Observações adicionais..." />
          </div>
          {/* Photos */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2"><Camera className="w-3.5 h-3.5" /> Fotografias</label>
            <div className="flex flex-wrap gap-2">
              {checkinPhotos.map((p, i) => (
                <div key={i} className="relative group">
                  <img src={p.url} alt="Foto" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => setCheckinPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition">
                {uploadingPhoto ? (
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-gray-400" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadPhoto(f); }} />
              </label>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={!formClient} className="btn-primary">Guardar Check-in</button>
        </div>
      )}

      {/* Check-in list */}
      {loading ? (
        <div className="text-center py-12"><p className="text-gray-400">A carregar...</p></div>
      ) : checkins.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Sem check-ins registados</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-3 capitalize">{date}</h3>
              <div className="space-y-3">
                {items.map((ci) => (
                  <div key={ci.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-semibold">
                          {ci.client?.avatar ? <img src={ci.client.avatar} className="w-9 h-9 rounded-full object-cover" /> : ci.client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{ci.client.name}</p>
                          <p className="text-xs text-gray-400">{new Date(ci.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ci.trainedToday && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">Treinou</span>}
                        {ci.followedDiet && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">Dieta ✓</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <MetricBadge value={ci.mood} icon={Heart} label="Humor" />
                      <MetricBadge value={ci.energy} icon={Zap} label="Energia" />
                      <MetricBadge value={ci.sleep} icon={Moon} label="Sono" />
                      <MetricBadge value={ci.soreness} icon={Flame} label="Dor" />
                      <MetricBadge value={ci.stress} icon={Brain} label="Stress" />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {ci.waterLiters && <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{ci.waterLiters}L</span>}
                      {ci.weight && <span className="flex items-center gap-1"><Weight className="w-3 h-3" />{ci.weight}kg</span>}
                    </div>
                    {ci.notes && <p className="text-sm text-gray-600 mt-2 border-t border-gray-50 pt-2">{ci.notes}</p>}
                    {ci.photos && (() => {
                      try {
                        const photos: {url: string; label: string}[] = JSON.parse(ci.photos);
                        if (photos.length === 0) return null;
                        return (
                          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50 overflow-x-auto">
                            {photos.map((p, i) => (
                              <img key={i} src={p.url} alt="Foto" className="w-14 h-14 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition flex-shrink-0" onClick={() => setLightboxUrl(p.url)} />
                            ))}
                          </div>
                        );
                      } catch { return null; }
                    })()}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Foto" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
          <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70" onClick={() => setLightboxUrl(null)}>
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
