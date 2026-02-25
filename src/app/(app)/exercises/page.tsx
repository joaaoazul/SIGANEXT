"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Play,
  ExternalLink,
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
  difficulty: string;
  instructions: string | null;
}

const muscleGroups = [
  { value: "chest", label: "Peito" },
  { value: "back", label: "Costas" },
  { value: "legs", label: "Pernas" },
  { value: "shoulders", label: "Ombros" },
  { value: "arms", label: "Braços" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Corpo Inteiro" },
];

const difficulties = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermédio" },
  { value: "advanced", label: "Avançado" },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);
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
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (muscleFilter) params.set("muscleGroup", muscleFilter);

    const res = await fetch(`/api/exercises?${params}`);
    const data = await res.json();
    setExercises(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, muscleFilter]);

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
  const getDifficultyLabel = (value: string) => difficulties.find(d => d.value === value)?.label || value;

  const difficultyColor: Record<string, string> = {
    beginner: "bg-emerald-50 text-emerald-600",
    intermediate: "bg-yellow-50 text-yellow-600",
    advanced: "bg-red-50 text-red-600",
  };

  const muscleColors: Record<string, string> = {
    chest: "bg-blue-50 text-blue-600",
    back: "bg-purple-50 text-purple-600",
    legs: "bg-orange-50 text-orange-600",
    shoulders: "bg-cyan-50 text-cyan-600",
    arms: "bg-pink-50 text-pink-600",
    core: "bg-yellow-50 text-yellow-600",
    cardio: "bg-red-50 text-red-600",
    full_body: "bg-emerald-50 text-emerald-600",
  };

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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar exercícios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
            className="input-field pl-10 pr-8 appearance-none"
          >
            <option value="">Todos os Grupos</option>
            {muscleGroups.map((mg) => (
              <option key={mg.value} value={mg.value}>{mg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : exercises.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="w-8 h-8" />}
          title="Nenhum exercício encontrado"
          description="Começa por adicionar exercícios à tua base de dados."
          action={
            <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
              <Plus className="w-4 h-4" /> Adicionar Exercício
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div key={ex.id} className="card hover:bg-gray-50 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{ex.name}</h3>
                  {ex.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ex.description}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                  <button onClick={() => openEdit(ex)} className="p-1.5 hover:bg-white rounded-lg">
                    <Edit className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(ex.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`badge ${muscleColors[ex.muscleGroup] || "bg-gray-100 text-gray-500"}`}>
                  {getMuscleLabel(ex.muscleGroup)}
                </span>
                <span className={`badge ${difficultyColor[ex.difficulty] || "bg-gray-100 text-gray-500"}`}>
                  {getDifficultyLabel(ex.difficulty)}
                </span>
                {ex.equipment && (
                  <span className="badge bg-gray-100 text-gray-500">{ex.equipment}</span>
                )}
              </div>

              {ex.videoUrl && (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-300 transition"
                >
                  <Play className="w-3.5 h-3.5" /> Ver Vídeo <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
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
