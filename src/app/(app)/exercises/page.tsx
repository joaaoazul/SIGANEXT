"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dumbbell, Plus, Search, Filter, Edit, Trash2, Play,
  ExternalLink, LayoutGrid, List, Info,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: string;
  equipment: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  difficulty: string;
  instructions: string | null;
}

const muscleGroups = [
  { value: "chest", label: "Peito", emoji: "🫁" },
  { value: "back", label: "Costas", emoji: "🔙" },
  { value: "legs", label: "Pernas", emoji: "🦵" },
  { value: "shoulders", label: "Ombros", emoji: "💪" },
  { value: "arms", label: "Braços", emoji: "💪" },
  { value: "core", label: "Core", emoji: "🎯" },
  { value: "cardio", label: "Cardio", emoji: "❤️" },
  { value: "full_body", label: "Corpo Inteiro", emoji: "🏋️" },
];

const difficulties = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermédio" },
  { value: "advanced", label: "Avançado" },
];

// Extract YouTube video ID for embed
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    muscleGroup: "chest",
    equipment: "",
    videoUrl: "",
    difficulty: "intermediate",
    instructions: "",
  });

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (muscleFilter) params.set("muscleGroup", muscleFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);
      const res = await fetch(`/api/exercises?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar exercícios");
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); setExercises([]); }
    setLoading(false);
  }, [search, muscleFilter, difficultyFilter]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editExercise ? "PUT" : "POST";
    const url = editExercise ? `/api/exercises/${editExercise.id}` : "/api/exercises";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setEditExercise(null);
      resetForm();
      fetchExercises();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tens a certeza que queres eliminar este exercício?")) return;
    await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    fetchExercises();
  };

  const resetForm = () => {
    setForm({ name: "", description: "", muscleGroup: "chest", equipment: "", videoUrl: "", difficulty: "intermediate", instructions: "" });
  };

  const openEdit = (ex: Exercise) => {
    setEditExercise(ex);
    setForm({
      name: ex.name,
      description: ex.description || "",
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment || "",
      videoUrl: ex.videoUrl || "",
      difficulty: ex.difficulty,
      instructions: ex.instructions || "",
    });
    setShowModal(true);
  };

  const getMuscleLabel = (value: string) => muscleGroups.find(m => m.value === value)?.label || value;
  const getMuscleEmoji = (value: string) => muscleGroups.find(m => m.value === value)?.emoji || "🏋️";
  const getDifficultyLabel = (value: string) => difficulties.find(d => d.value === value)?.label || value;

  const difficultyColor: Record<string, string> = {
    beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
    intermediate: "bg-amber-50 text-amber-700 border-amber-200",
    advanced: "bg-red-50 text-red-700 border-red-200",
  };

  const muscleColors: Record<string, string> = {
    chest: "bg-blue-50 text-blue-700 border-blue-200",
    back: "bg-purple-50 text-purple-700 border-purple-200",
    legs: "bg-orange-50 text-orange-700 border-orange-200",
    shoulders: "bg-cyan-50 text-cyan-700 border-cyan-200",
    arms: "bg-pink-50 text-pink-700 border-pink-200",
    core: "bg-yellow-50 text-yellow-700 border-yellow-200",
    cardio: "bg-red-50 text-red-700 border-red-200",
    full_body: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const muscleGradients: Record<string, string> = {
    chest: "from-blue-500 to-blue-600",
    back: "from-purple-500 to-purple-600",
    legs: "from-orange-500 to-orange-600",
    shoulders: "from-cyan-500 to-cyan-600",
    arms: "from-pink-500 to-pink-600",
    core: "from-yellow-500 to-yellow-600",
    cardio: "from-red-500 to-red-600",
    full_body: "from-emerald-500 to-emerald-600",
  };

  // Group exercises by muscle group for counter
  const groupCounts = exercises.reduce((acc, ex) => {
    acc[ex.muscleGroup] = (acc[ex.muscleGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <PageHeader
        title="Base de Dados de Exercícios"
        description={`${exercises.length} exercício(s) registado(s)`}
        action={
          <button onClick={() => { resetForm(); setEditExercise(null); setShowModal(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Exercício
          </button>
        }
      />

      {/* Muscle Group Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setMuscleFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!muscleFilter ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Todos
        </button>
        {muscleGroups.map((mg) => (
          <button
            key={mg.value}
            onClick={() => setMuscleFilter(muscleFilter === mg.value ? "" : mg.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${muscleFilter === mg.value ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {mg.emoji} {mg.label} {groupCounts[mg.value] ? `(${groupCounts[mg.value]})` : ""}
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Pesquisar por nome, equipamento..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="input-field pl-10 pr-8 appearance-none">
              <option value="">Todas Dificuldades</option>
              {difficulties.map((d) => (<option key={d.value} value={d.value}>{d.label}</option>))}
            </select>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2.5 ${viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="w-8 h-8" />}
          title="Nenhum exercício encontrado"
          description="Começa por adicionar exercícios à tua base de dados."
          action={<button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary"><Plus className="w-4 h-4" /> Adicionar Exercício</button>}
        />
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div key={ex.id} className="card hover:shadow-md transition-all group cursor-pointer" onClick={() => setDetailExercise(ex)}>
              {/* Thumbnail / Color Header */}
              {ex.thumbnailUrl ? (
                <div className="relative -mx-5 -mt-5 mb-4 h-36 rounded-t-2xl overflow-hidden bg-gray-100">
                  <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-sm font-bold text-white drop-shadow-sm">{ex.name}</h3>
                  </div>
                </div>
              ) : (
                <div className={`relative -mx-5 -mt-5 mb-4 h-24 rounded-t-2xl bg-gradient-to-br ${muscleGradients[ex.muscleGroup] || "from-gray-500 to-gray-600"} flex items-center justify-center`}>
                  <span className="text-3xl opacity-30">{getMuscleEmoji(ex.muscleGroup)}</span>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-sm font-bold text-white drop-shadow-sm">{ex.name}</h3>
                  </div>
                </div>
              )}

              {ex.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ex.description}</p>}

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${muscleColors[ex.muscleGroup] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {getMuscleLabel(ex.muscleGroup)}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${difficultyColor[ex.difficulty] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {getDifficultyLabel(ex.difficulty)}
                </span>
                {ex.equipment && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500 border border-gray-200">{ex.equipment}</span>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ex.videoUrl && <span className="flex items-center gap-1 text-[10px] text-emerald-600"><Play className="w-3 h-3" /> Vídeo</span>}
                  {ex.instructions && <span className="flex items-center gap-1 text-[10px] text-blue-600"><Info className="w-3 h-3" /> Instruções</span>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(ex)} className="p-1.5 hover:bg-white rounded-lg shadow-sm bg-gray-50">
                    <Edit className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(ex.id)} className="p-1.5 hover:bg-red-50 rounded-lg shadow-sm bg-gray-50">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div key={ex.id} className="card !py-3 hover:shadow-md transition-all group cursor-pointer" onClick={() => setDetailExercise(ex)}>
              <div className="flex items-center gap-4">
                {ex.thumbnailUrl ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${muscleGradients[ex.muscleGroup] || "from-gray-500 to-gray-600"} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xl opacity-50">{getMuscleEmoji(ex.muscleGroup)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{ex.name}</h3>
                  {ex.description && <p className="text-xs text-gray-500 truncate mt-0.5 hidden sm:block">{ex.description}</p>}
                  <p className="text-[10px] text-gray-400 mt-0.5 sm:hidden">{getMuscleLabel(ex.muscleGroup)} · {getDifficultyLabel(ex.difficulty)}</p>
                </div>
                <div className="hidden sm:flex flex-wrap gap-1.5 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${muscleColors[ex.muscleGroup] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {getMuscleLabel(ex.muscleGroup)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${difficultyColor[ex.difficulty] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {getDifficultyLabel(ex.difficulty)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ex.videoUrl && <Play className="w-3.5 h-3.5 text-emerald-500" />}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(ex)} className="p-1.5 hover:bg-white rounded-lg">
                      <Edit className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(ex.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {detailExercise && (
        <Modal
          isOpen={!!detailExercise}
          onClose={() => setDetailExercise(null)}
          title={detailExercise.name}
          size="lg"
        >
          <div className="space-y-5">
            {/* Video Embed */}
            {detailExercise.videoUrl && getYouTubeId(detailExercise.videoUrl) ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(detailExercise.videoUrl)}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={detailExercise.name}
                />
              </div>
            ) : detailExercise.thumbnailUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 h-48">
                <img src={detailExercise.thumbnailUrl} alt={detailExercise.name} className="w-full h-full object-cover" />
                {detailExercise.videoUrl && (
                  <a href={detailExercise.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-emerald-600 ml-1" />
                    </div>
                  </a>
                )}
              </div>
            ) : detailExercise.videoUrl ? (
              <a href={detailExercise.videoUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
                <Play className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Ver Vídeo Demonstrativo</span>
                <ExternalLink className="w-4 h-4 text-emerald-500 ml-auto" />
              </a>
            ) : null}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${muscleColors[detailExercise.muscleGroup] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {getMuscleEmoji(detailExercise.muscleGroup)} {getMuscleLabel(detailExercise.muscleGroup)}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${difficultyColor[detailExercise.difficulty] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {getDifficultyLabel(detailExercise.difficulty)}
              </span>
              {detailExercise.equipment && (
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  🏋️ {detailExercise.equipment}
                </span>
              )}
            </div>

            {/* Description */}
            {detailExercise.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1.5">Descrição</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{detailExercise.description}</p>
              </div>
            )}

            {/* Instructions */}
            {detailExercise.instructions && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Instruções de Execução</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {detailExercise.instructions.split("\n").map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {line.match(/^\d+\./) ? (
                        <>
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {line.match(/^(\d+)\./)?.[1]}
                          </span>
                          <p className="text-sm text-gray-700">{line.replace(/^\d+\.\s*/, "")}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-700">{line}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <button onClick={() => { const ex = detailExercise; setDetailExercise(null); openEdit(ex); }} className="btn-secondary text-xs">
                <Edit className="w-3.5 h-3.5" /> Editar
              </button>
              <button onClick={() => setDetailExercise(null)} className="btn-primary text-xs">
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditExercise(null); resetForm(); }}
        title={editExercise ? "Editar Exercício" : "Novo Exercício"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Ex: Supino Plano com Barra" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Grupo Muscular *</label>
              <select value={form.muscleGroup} onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })} className="input-field" required>
                {muscleGroups.map((mg) => (
                  <option key={mg.value} value={mg.value}>{mg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Dificuldade</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field">
                {difficulties.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Equipamento</label>
              <input type="text" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} className="input-field" placeholder="Ex: Barra, Halteres" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">URL do Vídeo</label>
              <input type="url" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="input-field" placeholder="https://youtube.com/..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[60px]" placeholder="Breve descrição do exercício..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Instruções</label>
            <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="input-field min-h-[80px]" placeholder="Passo 1: ...\nPasso 2: ..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setShowModal(false); setEditExercise(null); }} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editExercise ? "Guardar" : "Criar Exercício"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
