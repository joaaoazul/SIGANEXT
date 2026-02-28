"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Trash2,
  Users,
  Target,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Flame,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

interface NutritionPlan {
  id: string;
  name: string;
  description: string | null;
  totalCalories: number | null;
  totalProtein: number | null;
  totalCarbs: number | null;
  totalFat: number | null;
  goal: string | null;
  meals: {
    id: string;
    name: string;
    time: string | null;
    foods: {
      id: string;
      quantity: number;
      unit: string;
      food: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number };
    }[];
  }[];
  assignments: { client: { id: string; name: string } }[];
  _count: { assignments: number };
}

interface Client { id: string; name: string; email: string; }

const goals = [
  { value: "muscle_gain", label: "Ganho Muscular" },
  { value: "fat_loss", label: "Perda de Gordura" },
  { value: "maintenance", label: "Manutenção" },
  { value: "performance", label: "Performance" },
];

export default function NutritionPage() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignClientId, setAssignClientId] = useState("");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", totalCalories: "", totalProtein: "", totalCarbs: "", totalFat: "", goal: "",
  });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nutrition");
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

  useEffect(() => { fetchPlans(); fetchClients(); }, [fetchPlans, fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", description: "", totalCalories: "", totalProtein: "", totalCarbs: "", totalFat: "", goal: "" });
      fetchPlans();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este plano de nutrição?")) return;
    await fetch(`/api/nutrition/${id}`, { method: "DELETE" });
    fetchPlans();
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/nutrition/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: assignClientId, nutritionPlanId: assignPlanId }),
    });
    if (res.ok) { setShowAssign(false); setAssignPlanId(""); setAssignClientId(""); fetchPlans(); }
  };

  const getGoalLabel = (v: string | null) => goals.find(g => g.value === v)?.label || v || "—";

  const filtered = plans.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const calcMealMacros = (meal: NutritionPlan["meals"][0]) => {
    let cal = 0, prot = 0, carb = 0, fat = 0;
    meal.foods.forEach((mf) => {
      const factor = mf.quantity / 100;
      cal += mf.food.calories * factor;
      prot += mf.food.protein * factor;
      carb += mf.food.carbs * factor;
      fat += mf.food.fat * factor;
    });
    return { cal: Math.round(cal), prot: Math.round(prot), carb: Math.round(carb), fat: Math.round(fat) };
  };

  return (
    <div>
      <PageHeader
        title="Planos de Nutrição"
        description={`${plans.length} plano(s) criado(s)`}
        action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Novo Plano</button>}
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
          icon={<UtensilsCrossed className="w-8 h-8" />}
          title="Nenhum plano de nutrição"
          description="Cria o teu primeiro plano de nutrição."
          action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Criar Plano</button>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((plan) => (
            <div key={plan.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}>
                  {expandedPlan === plan.id ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    {plan.description && <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setAssignPlanId(plan.id); setShowAssign(true); }} className="btn-secondary text-xs py-1.5 px-3">
                    <UserPlus className="w-3.5 h-3.5" /> Atribuir
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Macros summary */}
              <div className="flex flex-wrap gap-4 mt-3">
                {plan.totalCalories && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Flame className="w-3.5 h-3.5 text-orange-600" /> {plan.totalCalories} kcal
                  </div>
                )}
                {plan.totalProtein && <span className="text-xs text-red-600">P: {plan.totalProtein}g</span>}
                {plan.totalCarbs && <span className="text-xs text-yellow-600">HC: {plan.totalCarbs}g</span>}
                {plan.totalFat && <span className="text-xs text-orange-600">G: {plan.totalFat}g</span>}
                {plan.goal && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Target className="w-3.5 h-3.5" /> {getGoalLabel(plan.goal)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" /> {plan._count.assignments} cliente(s)
                </div>
              </div>

              {expandedPlan === plan.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {plan.meals.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma refeição adicionada</p>
                  ) : (
                    plan.meals.map((meal) => {
                      const macros = calcMealMacros(meal);
                      return (
                        <div key={meal.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">{meal.name} {meal.time && <span className="text-gray-400 font-normal">({meal.time})</span>}</h4>
                            <span className="text-xs text-gray-400">{macros.cal} kcal | P:{macros.prot}g HC:{macros.carb}g G:{macros.fat}g</span>
                          </div>
                          {meal.foods.length === 0 ? (
                            <p className="text-xs text-gray-400">Sem alimentos</p>
                          ) : (
                            <div className="space-y-1">
                              {meal.foods.map((mf) => (
                                <div key={mf.id} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">{mf.food.name}</span>
                                  <span className="text-gray-400">{mf.quantity}{mf.unit}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  {plan.assignments.length > 0 && (
                    <div className="pt-3">
                      <p className="text-xs text-gray-400 mb-2">Clientes atribuídos:</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.assignments.map((a) => (
                          <span key={a.client.id} className="badge bg-emerald-50 text-emerald-600">{a.client.name}</span>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Plano de Nutrição" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Calorias totais</label>
              <input type="number" value={form.totalCalories} onChange={(e) => setForm({ ...form, totalCalories: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Proteína (g)</label>
              <input type="number" value={form.totalProtein} onChange={(e) => setForm({ ...form, totalProtein: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">HC (g)</label>
              <input type="number" value={form.totalCarbs} onChange={(e) => setForm({ ...form, totalCarbs: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Gordura (g)</label>
              <input type="number" value={form.totalFat} onChange={(e) => setForm({ ...form, totalFat: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Objetivo</label>
            <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="input-field">
              <option value="">Selecionar</option>
              {goals.map(g => (<option key={g.value} value={g.value}>{g.label}</option>))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Criar Plano</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Atribuir Plano de Nutrição">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cliente *</label>
            <select value={assignClientId} onChange={(e) => setAssignClientId(e.target.value)} className="input-field" required>
              <option value="">Selecionar cliente</option>
              {clients.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.email})</option>))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAssign(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Atribuir</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
