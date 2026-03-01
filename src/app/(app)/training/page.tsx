"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ClipboardList, Plus, Search, Trash2, Users, Calendar, Target,
  ChevronDown, ChevronRight, UserPlus, Dumbbell, X, GripVertical,
  Check, Copy, Edit3, Play, Timer, Weight, Hash, RotateCcw,
  Zap, Flame, Shield, Wind, Sparkles, ChevronUp,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  difficulty: string;
  description?: string | null;
  videoUrl?: string | null;
}

interface TrainingExercise {
  id: string;
  sets: number;
  reps: string;
  restSeconds: number;
  weight: string | null;
  notes: string | null;
  exercise: Exercise;
}

interface Workout {
  id: string;
  name: string;
  dayOfWeek?: number;
  exercises: TrainingExercise[];
}

interface TrainingPlan {
  id: string;
  name: string;
  description: string | null;
  duration: number | null;
  goal: string | null;
  difficulty: string;
  workouts: Workout[];
  assignments: { client: { id: string; name: string } }[];
  _count: { assignments: number };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const goals = [
  { value: "muscle_gain", label: "Ganho Muscular", icon: Dumbbell, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "fat_loss", label: "Perda de Gordura", icon: Flame, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "strength", label: "Força", icon: Shield, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { value: "endurance", label: "Resistência", icon: Wind, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { value: "flexibility", label: "Flexibilidade", icon: Sparkles, color: "text-pink-600 bg-pink-50 border-pink-200" },
];

const muscleGroupFilters = [
  { value: "chest", label: "Peito", emoji: "🫁" },
  { value: "back", label: "Costas", emoji: "🔙" },
  { value: "shoulders", label: "Ombros", emoji: "💪" },
  { value: "arms", label: "Braços", emoji: "💪" },
  { value: "legs", label: "Pernas", emoji: "🦵" },
  { value: "core", label: "Core", emoji: "🎯" },
  { value: "cardio", label: "Cardio", emoji: "❤️" },
  { value: "full_body", label: "Corpo Inteiro", emoji: "🏋️" },
];

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

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: "Iniciante", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  intermediate: { label: "Intermédio", color: "text-amber-700 bg-amber-50 border-amber-200" },
  advanced: { label: "Avançado", color: "text-red-700 bg-red-50 border-red-200" },
};

const workoutLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
const workoutColors = [
  "from-emerald-500 to-emerald-600",
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-cyan-500 to-cyan-600",
  "from-yellow-500 to-yellow-600",
  "from-red-500 to-red-600",
];

// Toast notification component
function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <div className="bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-400" />
        {message}
      </div>
    </div>
  );
}

export default function TrainingPage() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignClientId, setAssignClientId] = useState("");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState("");
  const [activePlanId, setActivePlanId] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseGroup, setExerciseGroup] = useState("");
  const [addedExercises, setAddedExercises] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState({ show: false, message: "" });
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());
  const [editingExercise, setEditingExercise] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", description: "", duration: "", goal: "", difficulty: "intermediate" });
  const [workoutForm, setWorkoutForm] = useState({ name: "", notes: "" });

  // Debounce timers
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/training");
      if (!res.ok) throw new Error("Erro ao carregar planos");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); setPlans([]); }
    setLoading(false);
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Erro ao carregar clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }, []);

  const fetchExercises = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (exerciseSearch) params.set("search", exerciseSearch);
      if (exerciseGroup) params.set("muscleGroup", exerciseGroup);
      const res = await fetch(`/api/exercises?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar exercícios");
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }, [exerciseSearch, exerciseGroup]);

  useEffect(() => { fetchPlans(); fetchClients(); }, [fetchPlans, fetchClients]);
  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  // Cleanup debounce timers
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", description: "", duration: "", goal: "", difficulty: "intermediate" });
      fetchPlans();
      showToast("Plano de treino criado!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este plano de treino?")) return;
    await fetch(`/api/training/${id}`, { method: "DELETE" });
    fetchPlans();
    showToast("Plano eliminado");
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/training/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: assignClientId, trainingPlanId: assignPlanId }),
    });
    if (res.ok) {
      setShowAssign(false);
      setAssignPlanId("");
      setAssignClientId("");
      fetchPlans();
      showToast("Plano atribuído ao cliente!");
    }
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/training/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainingPlanId: activePlanId, ...workoutForm }),
    });
    if (res.ok) {
      setShowWorkoutModal(false);
      setWorkoutForm({ name: "", notes: "" });
      fetchPlans();
      showToast("Treino adicionado ao plano!");
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm("Eliminar este treino?")) return;
    await fetch(`/api/training/workouts?id=${workoutId}`, { method: "DELETE" });
    fetchPlans();
    showToast("Treino eliminado");
  };

  const handleAddExercise = async (exercise: Exercise) => {
    const res = await fetch("/api/training/workouts/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutId: activeWorkoutId, exerciseId: exercise.id }),
    });
    if (res.ok) {
      setAddedExercises(prev => new Set([...prev, exercise.id]));
      fetchPlans();
      showToast(`${exercise.name} adicionado!`);
      // Reset "added" state after 2s
      setTimeout(() => {
        setAddedExercises(prev => {
          const next = new Set(prev);
          next.delete(exercise.id);
          return next;
        });
      }, 2000);
    }
  };

  const handleRemoveExercise = async (trainingExerciseId: string) => {
    await fetch(`/api/training/workouts/exercises?id=${trainingExerciseId}`, { method: "DELETE" });
    fetchPlans();
    showToast("Exercício removido");
  };

  // Debounced update for exercise fields
  const handleUpdateExercise = (trainingExId: string, field: string, value: string | number) => {
    const key = `${trainingExId}-${field}`;
    setSavingFields(prev => new Set([...prev, key]));

    // Update local state immediately for responsive feel
    setPlans(prev => prev.map(plan => ({
      ...plan,
      workouts: plan.workouts.map(w => ({
        ...w,
        exercises: w.exercises.map(ex =>
          ex.id === trainingExId ? { ...ex, [field]: value } : ex
        ),
      })),
    })));

    // Debounce the API call
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(async () => {
      await fetch("/api/training/workouts/exercises", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trainingExId, [field]: value }),
      });
      setSavingFields(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 600);
  };

  const handleDuplicatePlan = async (plan: TrainingPlan) => {
    const res = await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${plan.name} (cópia)`,
        description: plan.description,
        duration: plan.duration,
        goal: plan.goal,
        difficulty: plan.difficulty,
      }),
    });
    if (res.ok) {
      fetchPlans();
      showToast("Plano duplicado!");
    }
  };

  const getGoalLabel = (value: string | null) => goals.find(g => g.value === value)?.label || value || "—";
  const getGoalConfig = (value: string | null) => goals.find(g => g.value === value);
  const getMuscleLabel = (value: string) => muscleGroupFilters.find(m => m.value === value)?.label || value;
  const getMuscleEmoji = (value: string) => muscleGroupFilters.find(m => m.value === value)?.emoji || "🏋️";

  const filtered = plans.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get total exercises in plan
  const getPlanExerciseCount = (plan: TrainingPlan) =>
    plan.workouts.reduce((sum, w) => sum + w.exercises.length, 0);

  // Get exercises already in current workout
  const getWorkoutExerciseIds = () => {
    const plan = plans.find(p => p.workouts.some(w => w.id === activeWorkoutId));
    const workout = plan?.workouts.find(w => w.id === activeWorkoutId);
    return new Set(workout?.exercises.map(e => e.exercise.id) || []);
  };

  return (
    <div>
      <PageHeader
        title="Planos de Treino"
        description={`${plans.length} plano(s) • ${plans.reduce((s, p) => s + p.workouts.length, 0)} treinos • ${plans.reduce((s, p) => s + getPlanExerciseCount(p), 0)} exercícios`}
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Plano
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Pesquisar planos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8" />}
          title="Nenhum plano de treino"
          description="Cria o teu primeiro plano de treino."
          action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Criar Plano</button>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((plan) => {
            const goalConfig = getGoalConfig(plan.goal);
            const GoalIcon = goalConfig?.icon || Target;
            const isExpanded = expandedPlan === plan.id;

            return (
              <div key={plan.id} className={`card transition-all duration-300 ${isExpanded ? "ring-2 ring-emerald-200 shadow-lg" : "hover:shadow-md"}`}>
                {/* Plan Header */}
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1 group"
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${isExpanded ? "bg-emerald-500 text-white shadow-md" : "bg-gray-100 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"}`}>
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      {plan.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{plan.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                    <button
                      onClick={() => { setAssignPlanId(plan.id); setShowAssign(true); }}
                      className="p-2 hover:bg-emerald-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Atribuir a cliente"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicatePlan(plan)}
                      className="p-2 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
                      title="Duplicar plano"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar plano"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Plan Meta Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {plan.goal && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${goalConfig?.color || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      <GoalIcon className="w-3 h-3" /> {getGoalLabel(plan.goal)}
                    </span>
                  )}
                  {plan.difficulty && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${difficultyConfig[plan.difficulty]?.color || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {difficultyConfig[plan.difficulty]?.label || plan.difficulty}
                    </span>
                  )}
                  {plan.duration && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                      <Calendar className="w-3 h-3" /> {plan.duration} semanas
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                    <Dumbbell className="w-3 h-3" /> {plan.workouts.length} treino(s) • {getPlanExerciseCount(plan)} exerc.
                  </span>
                  {plan._count.assignments > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Users className="w-3 h-3" /> {plan._count.assignments} cliente(s)
                    </span>
                  )}
                </div>

                {/* Expanded Workouts */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Workout Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" /> Treinos do Plano
                      </h4>
                      <button
                        onClick={() => { setActivePlanId(plan.id); setShowWorkoutModal(true); }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Treino
                      </button>
                    </div>

                    {plan.workouts.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                        <Dumbbell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Nenhum treino adicionado.</p>
                        <button
                          onClick={() => { setActivePlanId(plan.id); setShowWorkoutModal(true); }}
                          className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          + Criar primeiro treino
                        </button>
                      </div>
                    ) : (
                      plan.workouts.map((w, wIdx) => {
                        const isWorkoutExpanded = expandedWorkout === w.id;
                        const gradient = workoutColors[wIdx % workoutColors.length];
                        const letter = workoutLetters[wIdx % workoutLetters.length];

                        return (
                          <div key={w.id} className={`rounded-xl border transition-all duration-200 ${isWorkoutExpanded ? "border-gray-200 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}>
                            {/* Workout Header */}
                            <div
                              className="flex items-center gap-3 p-4 cursor-pointer"
                              onClick={() => setExpandedWorkout(isWorkoutExpanded ? null : w.id)}
                            >
                              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                <span className="text-sm font-bold text-white">{letter}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-semibold text-gray-900">{w.name}</h5>
                                <p className="text-xs text-gray-400 mt-0.5">{w.exercises.length} exercício(s)</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveWorkoutId(w.id); setShowExercisePicker(true); }}
                                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                                  title="Adicionar exercício"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(w.id); }}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                  title="Eliminar treino"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {isWorkoutExpanded ?
                                  <ChevronUp className="w-4 h-4 text-gray-300" /> :
                                  <ChevronDown className="w-4 h-4 text-gray-300" />
                                }
                              </div>
                            </div>

                            {/* Workout Exercises */}
                            {isWorkoutExpanded && (
                              <div className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                                {/* Column headers for exercises */}
                                {w.exercises.length > 0 && (
                                  <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                    <span className="w-5" />
                                    <span className="w-5">#</span>
                                    <span className="flex-1">Exercício</span>
                                    <span className="w-14 text-center">Séries</span>
                                    <span className="w-1" />
                                    <span className="w-16 text-center">Reps</span>
                                    <span className="w-16 text-center">Peso</span>
                                    <span className="w-16 text-center">Desc.</span>
                                    <span className="w-7" />
                                  </div>
                                )}

                                {w.exercises.length === 0 ? (
                                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">Sem exercícios neste treino</p>
                                    <button
                                      onClick={() => { setActiveWorkoutId(w.id); setShowExercisePicker(true); }}
                                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                      + Adicionar exercícios
                                    </button>
                                  </div>
                                ) : (
                                  w.exercises.map((ex, idx) => {
                                    const isEditing = editingExercise === ex.id;
                                    return (
                                      <div
                                        key={ex.id}
                                        className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all duration-150
                                          ${isEditing ? "bg-emerald-50 border border-emerald-200 shadow-sm" : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}
                                        onClick={() => setEditingExercise(isEditing ? null : ex.id)}
                                      >
                                        <GripVertical className="w-3.5 h-3.5 text-gray-200 flex-shrink-0 cursor-grab" />
                                        <span className="text-xs font-bold text-gray-300 w-5">{idx + 1}</span>

                                        {/* Exercise name and muscle */}
                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                          <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${muscleGradients[ex.exercise.muscleGroup] || "from-gray-400 to-gray-500"} flex items-center justify-center flex-shrink-0`}>
                                            <span className="text-xs">{getMuscleEmoji(ex.exercise.muscleGroup)}</span>
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{ex.exercise.name}</p>
                                            <p className="text-[10px] text-gray-400">{getMuscleLabel(ex.exercise.muscleGroup)}{ex.exercise.equipment ? ` • ${ex.exercise.equipment}` : ""}</p>
                                          </div>
                                        </div>

                                        {/* Inline editable fields */}
                                        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                          <div className="relative">
                                            <input
                                              type="number"
                                              min={1}
                                              value={ex.sets}
                                              onChange={(e) => handleUpdateExercise(ex.id, "sets", parseInt(e.target.value) || 1)}
                                              className="w-14 text-center text-xs font-medium border border-gray-200 rounded-lg py-1.5 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all bg-gray-50 hover:bg-white"
                                              title="Séries"
                                            />
                                            {savingFields.has(`${ex.id}-sets`) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                                          </div>
                                          <span className="text-xs text-gray-300 font-bold">×</span>
                                          <div className="relative">
                                            <input
                                              type="text"
                                              value={ex.reps}
                                              onChange={(e) => handleUpdateExercise(ex.id, "reps", e.target.value)}
                                              className="w-16 text-center text-xs font-medium border border-gray-200 rounded-lg py-1.5 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all bg-gray-50 hover:bg-white"
                                              title="Repetições"
                                              placeholder="12"
                                            />
                                            {savingFields.has(`${ex.id}-reps`) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                                          </div>
                                          <div className="relative">
                                            <input
                                              type="text"
                                              value={ex.weight || ""}
                                              onChange={(e) => handleUpdateExercise(ex.id, "weight", e.target.value)}
                                              className="w-16 text-center text-xs font-medium border border-gray-200 rounded-lg py-1.5 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all bg-gray-50 hover:bg-white"
                                              title="Peso (kg)"
                                              placeholder="— kg"
                                            />
                                            {savingFields.has(`${ex.id}-weight`) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                                          </div>
                                          <div className="relative flex items-center">
                                            <input
                                              type="number"
                                              min={0}
                                              value={ex.restSeconds}
                                              onChange={(e) => handleUpdateExercise(ex.id, "restSeconds", parseInt(e.target.value) || 0)}
                                              className="w-16 text-center text-xs font-medium border border-gray-200 rounded-lg py-1.5 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all bg-gray-50 hover:bg-white pr-5"
                                              title="Descanso (segundos)"
                                            />
                                            <Timer className="w-3 h-3 text-gray-300 absolute right-1.5" />
                                            {savingFields.has(`${ex.id}-restSeconds`) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                                          </div>
                                          <button
                                            onClick={() => handleRemoveExercise(ex.id)}
                                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remover exercício"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}

                                {/* Quick add button inside workout */}
                                {w.exercises.length > 0 && (
                                  <button
                                    onClick={() => { setActiveWorkoutId(w.id); setShowExercisePicker(true); }}
                                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:text-emerald-600 hover:border-emerald-300 transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar mais exercícios
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Assigned clients */}
                    {plan.assignments.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                          <Users className="w-3 h-3" /> Clientes atribuídos
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {plan.assignments.map((a) => (
                            <span key={a.client.id} className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                              <div className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-emerald-700">{a.client.name[0]}</span>
                              </div>
                              {a.client.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Create Plan Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Plano de Treino" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Plano *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field text-base"
              placeholder="Ex: Programa Hipertrofia 12 semanas"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[60px]"
              placeholder="Descreve o objetivo e estrutura do plano..."
            />
          </div>

          {/* Goal selector as cards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {goals.map((g) => {
                const Icon = g.icon;
                const isSelected = form.goal === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm({ ...form, goal: isSelected ? "" : g.value })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 bg-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-emerald-600" : "text-gray-400"}`} />
                    <span className={`text-xs font-medium ${isSelected ? "text-emerald-700" : "text-gray-600"}`}>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duração (semanas)</label>
              <input
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="input-field"
                placeholder="Ex: 12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dificuldade</label>
              <div className="flex gap-2">
                {Object.entries(difficultyConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, difficulty: key })}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border-2 transition-all ${
                      form.difficulty === key
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">
              <Plus className="w-4 h-4" /> Criar Plano
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Plan Modal */}
      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Atribuir Plano a Cliente">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Selecionar Cliente *</label>
            {clients.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhum cliente registado.</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAssignClientId(c.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      assignClientId === c.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      assignClientId === c.id ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <span className="text-xs font-bold">{c.name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.email}</p>
                    </div>
                    {assignClientId === c.id && <Check className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAssign(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={!assignClientId}>
              <UserPlus className="w-4 h-4" /> Atribuir
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Workout Modal */}
      <Modal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} title="Adicionar Treino">
        <form onSubmit={handleAddWorkout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Treino *</label>
            <input
              type="text"
              value={workoutForm.name}
              onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
              className="input-field"
              placeholder="Ex: Treino A — Peito e Tríceps"
              required
              autoFocus
            />
            {/* Quick name suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                "Treino A — Peito e Tríceps",
                "Treino B — Costas e Bíceps",
                "Treino C — Pernas e Ombros",
                "Treino D — Full Body",
                "Cardio + Core",
                "Upper Body",
                "Lower Body",
                "Push",
                "Pull",
                "Legs",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setWorkoutForm({ ...workoutForm, name: suggestion })}
                  className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
            <textarea
              value={workoutForm.notes}
              onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
              className="input-field min-h-[60px]"
              placeholder="Instruções gerais, tempo estimado, etc."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowWorkoutModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">
              <Plus className="w-4 h-4" /> Adicionar Treino
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== EXERCISE PICKER MODAL ===== */}
      <Modal
        isOpen={showExercisePicker}
        onClose={() => { setShowExercisePicker(false); setExerciseSearch(""); setExerciseGroup(""); }}
        title="Adicionar Exercícios ao Treino"
        size="xl"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar exercício por nome ou equipamento..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="input-field pl-10"
              autoFocus
            />
          </div>

          {/* Muscle group pill filters */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setExerciseGroup("")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                !exerciseGroup ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            {muscleGroupFilters.map((mg) => (
              <button
                key={mg.value}
                onClick={() => setExerciseGroup(exerciseGroup === mg.value ? "" : mg.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  exerciseGroup === mg.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {mg.emoji} {mg.label}
              </button>
            ))}
          </div>

          {/* Exercise list */}
          <div className="max-h-[400px] overflow-y-auto space-y-1 rounded-xl border border-gray-100 p-2">
            {exercises.length === 0 ? (
              <div className="text-center py-12">
                <Dumbbell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhum exercício encontrado.</p>
                <p className="text-xs text-gray-300 mt-1">Experimenta mudar o filtro ou a pesquisa.</p>
              </div>
            ) : (
              exercises.map((ex) => {
                const alreadyInWorkout = getWorkoutExerciseIds().has(ex.id);
                const justAdded = addedExercises.has(ex.id);

                return (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExercise(ex)}
                    disabled={justAdded}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                      justAdded
                        ? "bg-emerald-50 border border-emerald-200"
                        : alreadyInWorkout
                        ? "bg-gray-50 border border-gray-100"
                        : "hover:bg-gray-50 border border-transparent hover:border-gray-100"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${muscleGradients[ex.muscleGroup] || "from-gray-400 to-gray-500"} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-base">{getMuscleEmoji(ex.muscleGroup)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{ex.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {getMuscleLabel(ex.muscleGroup)}
                        {ex.equipment ? ` • ${ex.equipment}` : ""}
                        {ex.difficulty ? ` • ${difficultyConfig[ex.difficulty]?.label || ex.difficulty}` : ""}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {justAdded ? (
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : alreadyInWorkout ? (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Já adicionado</span>
                          <Plus className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {exercises.length} exercício(s) disponíveis • Clica para adicionar ao treino
            </p>
            <button
              onClick={() => { setShowExercisePicker(false); setExerciseSearch(""); setExerciseGroup(""); }}
              className="btn-primary text-xs"
            >
              Concluir
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}
