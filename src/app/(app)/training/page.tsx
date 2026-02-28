"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Plus, Search, Trash2, Users, Calendar, Target,
  ChevronDown, ChevronRight, UserPlus, Dumbbell, X, GripVertical,
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
}

interface TrainingExercise {
  id: string;
  sets: number;
  reps: string;
  restSeconds: number;
  weight: string | null;
  exercise: Exercise;
}

interface Workout {
  id: string;
  name: string;
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
  { value: "muscle_gain", label: "Ganho Muscular" },
  { value: "fat_loss", label: "Perda de Gordura" },
  { value: "strength", label: "Força" },
  { value: "endurance", label: "Resistência" },
  { value: "flexibility", label: "Flexibilidade" },
];

const muscleGroups = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Pernas",
  "Quadríceps", "Glúteos", "Gémeos", "Abdominais", "Core", "Cardio", "Full Body", "Outro",
];

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
  const [activeWorkoutId, setActiveWorkoutId] = useState("");
  const [activePlanId, setActivePlanId] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseGroup, setExerciseGroup] = useState("");

  const [form, setForm] = useState({ name: "", description: "", duration: "", goal: "", difficulty: "intermediate" });
  const [workoutForm, setWorkoutForm] = useState({ name: "", notes: "" });

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
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este plano de treino?")) return;
    await fetch(`/api/training/${id}`, { method: "DELETE" });
    fetchPlans();
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
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm("Eliminar este treino?")) return;
    await fetch(`/api/training/workouts?id=${workoutId}`, { method: "DELETE" });
    fetchPlans();
  };

  const handleAddExercise = async (exercise: Exercise) => {
    const res = await fetch("/api/training/workouts/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutId: activeWorkoutId, exerciseId: exercise.id }),
    });
    if (res.ok) {
      fetchPlans();
    }
  };

  const handleRemoveExercise = async (trainingExerciseId: string) => {
    await fetch(`/api/training/workouts/exercises?id=${trainingExerciseId}`, { method: "DELETE" });
    fetchPlans();
  };

  const handleUpdateExercise = async (trainingExId: string, field: string, value: string | number) => {
    await fetch("/api/training/workouts/exercises", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: trainingExId, [field]: value }),
    });
    fetchPlans();
  };

  const getGoalLabel = (value: string | null) => goals.find(g => g.value === value)?.label || value || "—";

  const filtered = plans.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Planos de Treino"
        description={`${plans.length} plano(s) criado(s)`}
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Plano
          </button>
        }
      />

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
          {filtered.map((plan) => (
            <div key={plan.id} className="card">
              <div className="flex items-start justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                >
                  {expandedPlan === plan.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    {plan.description && <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setAssignPlanId(plan.id); setShowAssign(true); }}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Atribuir
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                {plan.goal && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Target className="w-3.5 h-3.5" /> {getGoalLabel(plan.goal)}
                  </div>
                )}
                {plan.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" /> {plan.duration} semanas
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" /> {plan._count.assignments} cliente(s)
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Dumbbell className="w-3.5 h-3.5" /> {plan.workouts.length} treino(s)
                </div>
              </div>

              {/* Expanded workouts */}
              {expandedPlan === plan.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Treinos</h4>
                    <button
                      onClick={() => { setActivePlanId(plan.id); setShowWorkoutModal(true); }}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Treino
                    </button>
                  </div>

                  {plan.workouts.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhum treino. Adiciona o primeiro treino ao plano.</p>
                  ) : (
                    plan.workouts.map((w) => (
                      <div key={w.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">{w.name}</h4>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { setActiveWorkoutId(w.id); setShowExercisePicker(true); }}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50"
                            >
                              <Plus className="w-3 h-3" /> Exercício
                            </button>
                            <button onClick={() => handleDeleteWorkout(w.id)} className="p-1 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>

                        {w.exercises.length === 0 ? (
                          <p className="text-xs text-gray-400">Sem exercícios — usa o botão acima para adicionar</p>
                        ) : (
                          <div className="space-y-2">
                            {w.exercises.map((ex, idx) => (
                              <div key={ex.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                                <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                <span className="text-xs font-medium text-gray-400 w-5">{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-gray-800">{ex.exercise.name}</span>
                                  <span className="text-xs text-gray-400 ml-2">{ex.exercise.muscleGroup}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <input
                                    type="number"
                                    value={ex.sets}
                                    onChange={(e) => handleUpdateExercise(ex.id, "sets", parseInt(e.target.value) || 3)}
                                    className="w-12 text-center text-xs border border-gray-200 rounded-md py-1 focus:border-emerald-400 focus:outline-none"
                                    title="Séries"
                                  />
                                  <span className="text-xs text-gray-400">×</span>
                                  <input
                                    type="text"
                                    value={ex.reps}
                                    onChange={(e) => handleUpdateExercise(ex.id, "reps", e.target.value)}
                                    className="w-14 text-center text-xs border border-gray-200 rounded-md py-1 focus:border-emerald-400 focus:outline-none"
                                    title="Repetições"
                                    placeholder="12"
                                  />
                                  <input
                                    type="number"
                                    value={ex.restSeconds}
                                    onChange={(e) => handleUpdateExercise(ex.id, "restSeconds", parseInt(e.target.value) || 60)}
                                    className="w-14 text-center text-xs border border-gray-200 rounded-md py-1 focus:border-emerald-400 focus:outline-none"
                                    title="Descanso (s)"
                                  />
                                  <span className="text-xs text-gray-400">s</span>
                                  <button onClick={() => handleRemoveExercise(ex.id)} className="p-1 hover:bg-red-50 rounded">
                                    <X className="w-3.5 h-3.5 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Assigned clients */}
                  {plan.assignments.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2">Clientes atribuídos:</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.assignments.map((a) => (
                          <span key={a.client.id} className="badge bg-emerald-50 text-emerald-600">
                            {a.client.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Plano de Treino">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Ex: Programa Hipertrofia 12 semanas" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Duração (semanas)</label>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Objetivo</label>
              <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="input-field">
                <option value="">Selecionar</option>
                {goals.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Criar Plano</button>
          </div>
        </form>
      </Modal>

      {/* Assign Plan Modal */}
      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Atribuir Plano a Cliente">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cliente *</label>
            <select value={assignClientId} onChange={(e) => setAssignClientId(e.target.value)} className="input-field" required>
              <option value="">Selecionar cliente</option>
              {clients.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.email})</option>))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAssign(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Atribuir</button>
          </div>
        </form>
      </Modal>

      {/* Add Workout Modal */}
      <Modal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} title="Adicionar Treino ao Plano">
        <form onSubmit={handleAddWorkout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Treino *</label>
            <input
              type="text"
              value={workoutForm.name}
              onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
              className="input-field"
              placeholder="Ex: Treino A — Peito e Tríceps"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
            <textarea
              value={workoutForm.notes}
              onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
              className="input-field min-h-[60px]"
              placeholder="Instruções ou observações..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowWorkoutModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Adicionar</button>
          </div>
        </form>
      </Modal>

      {/* Exercise Picker Modal */}
      <Modal
        isOpen={showExercisePicker}
        onClose={() => { setShowExercisePicker(false); setExerciseSearch(""); setExerciseGroup(""); }}
        title="Adicionar Exercício"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar exercício..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={exerciseGroup}
              onChange={(e) => setExerciseGroup(e.target.value)}
              className="input-field w-40"
            >
              <option value="">Todos os grupos</option>
              {muscleGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
            {exercises.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Nenhum exercício encontrado. Cria exercícios na secção &quot;Exercícios&quot;.
              </p>
            ) : (
              exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExercise(ex)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{ex.name}</p>
                      <p className="text-xs text-gray-400">{ex.muscleGroup}{ex.equipment ? ` • ${ex.equipment}` : ""}</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition" />
                </button>
              ))
            )}
          </div>

          <p className="text-xs text-gray-400 text-center">
            Clica num exercício para adicioná-lo ao treino. Podes ajustar séries, reps e descanso depois.
          </p>
        </div>
      </Modal>
    </div>
  );
}
