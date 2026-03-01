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
  Edit,
  X,
  GripVertical,
  Copy,
  Clock,
  Apple,
  Save,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  category: string;
  brand: string | null;
  servingSize: number | null;
  servingUnit: string | null;
}

interface MealFoodItem {
  id?: string;
  foodId: string;
  food: Food;
  quantity: number;
  unit: string;
  notes: string;
  order: number;
}

interface MealItem {
  id?: string;
  name: string;
  time: string;
  notes: string;
  order: number;
  foods: MealFoodItem[];
}

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
    notes: string | null;
    foods: {
      id: string;
      quantity: number;
      unit: string;
      notes: string | null;
      food: Food;
    }[];
  }[];
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
  { value: "maintenance", label: "Manutenção" },
  { value: "performance", label: "Performance" },
  { value: "health", label: "Saúde Geral" },
  { value: "weight_gain", label: "Aumento de Peso" },
];

const mealTemplates = [
  { name: "Pequeno-almoço", time: "07:30" },
  { name: "Lanche da Manhã", time: "10:00" },
  { name: "Almoço", time: "12:30" },
  { name: "Lanche da Tarde", time: "16:00" },
  { name: "Jantar", time: "19:30" },
  { name: "Ceia", time: "22:00" },
  { name: "Pré-treino", time: "17:00" },
  { name: "Pós-treino", time: "18:30" },
];

export default function NutritionPage() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [goalFilter, setGoalFilter] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignClientId, setAssignClientId] = useState("");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<NutritionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // Editor state
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planGoal, setPlanGoal] = useState("");
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [foodSearch, setFoodSearch] = useState("");
  const [activeMealIndex, setActiveMealIndex] = useState<number | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nutrition");
      if (!res.ok) throw new Error("Erro");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
    }
    setLoading(false);
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Erro");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      /* empty */
    }
  }, []);

  const fetchFoods = useCallback(async () => {
    try {
      const res = await fetch("/api/foods?limit=500");
      if (!res.ok) throw new Error("Erro");
      const data = await res.json();
      setAllFoods(Array.isArray(data) ? data : []);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchClients();
    fetchFoods();
  }, [fetchPlans, fetchClients, fetchFoods]);

  const calcPlanMacros = (mealList: MealItem[]) => {
    let cal = 0, prot = 0, carb = 0, fat = 0;
    mealList.forEach((meal) => {
      meal.foods.forEach((mf) => {
        const factor = mf.quantity / 100;
        cal += mf.food.calories * factor;
        prot += mf.food.protein * factor;
        carb += mf.food.carbs * factor;
        fat += mf.food.fat * factor;
      });
    });
    return { cal: Math.round(cal), prot: Math.round(prot), carb: Math.round(carb), fat: Math.round(fat) };
  };

  const calcMealMacros = (meal: MealItem | NutritionPlan["meals"][0]) => {
    let cal = 0, prot = 0, carb = 0, fat = 0;
    const foodList = "foods" in meal ? meal.foods : [];
    foodList.forEach((mf) => {
      const food = "food" in mf ? mf.food : null;
      if (!food) return;
      const factor = mf.quantity / 100;
      cal += food.calories * factor;
      prot += food.protein * factor;
      carb += food.carbs * factor;
      fat += food.fat * factor;
    });
    return { cal: Math.round(cal), prot: Math.round(prot), carb: Math.round(carb), fat: Math.round(fat) };
  };

  const openNewPlan = () => {
    setEditingPlan(null);
    setPlanName("");
    setPlanDescription("");
    setPlanGoal("");
    setMeals([]);
    setActiveMealIndex(null);
    setShowEditor(true);
  };

  const openEditPlan = (plan: NutritionPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description || "");
    setPlanGoal(plan.goal || "");
    setMeals(
      plan.meals.map((m, idx) => ({
        id: m.id,
        name: m.name,
        time: m.time || "",
        notes: m.notes || "",
        order: idx,
        foods: m.foods.map((mf, fIdx) => ({
          id: mf.id,
          foodId: mf.food.id,
          food: mf.food,
          quantity: mf.quantity,
          unit: mf.unit,
          notes: mf.notes || "",
          order: fIdx,
        })),
      }))
    );
    setActiveMealIndex(null);
    setShowEditor(true);
  };

  const duplicatePlan = (plan: NutritionPlan) => {
    setEditingPlan(null);
    setPlanName(`${plan.name} (cópia)`);
    setPlanDescription(plan.description || "");
    setPlanGoal(plan.goal || "");
    setMeals(
      plan.meals.map((m, idx) => ({
        name: m.name,
        time: m.time || "",
        notes: m.notes || "",
        order: idx,
        foods: m.foods.map((mf, fIdx) => ({
          foodId: mf.food.id,
          food: mf.food,
          quantity: mf.quantity,
          unit: mf.unit,
          notes: mf.notes || "",
          order: fIdx,
        })),
      }))
    );
    setActiveMealIndex(null);
    setShowEditor(true);
  };

  const addMeal = (template?: { name: string; time: string }) => {
    const newMeal: MealItem = {
      name: template?.name || `Refeição ${meals.length + 1}`,
      time: template?.time || "",
      notes: "",
      order: meals.length,
      foods: [],
    };
    setMeals([...meals, newMeal]);
    setActiveMealIndex(meals.length);
  };

  const removeMeal = (index: number) => {
    const updated = meals.filter((_, i) => i !== index);
    setMeals(updated.map((m, i) => ({ ...m, order: i })));
    if (activeMealIndex === index) setActiveMealIndex(null);
    else if (activeMealIndex !== null && activeMealIndex > index) setActiveMealIndex(activeMealIndex - 1);
  };

  const addFoodToMeal = (mealIndex: number, food: Food) => {
    const updated = [...meals];
    updated[mealIndex].foods.push({
      foodId: food.id,
      food,
      quantity: food.servingSize || 100,
      unit: food.servingUnit || "g",
      notes: "",
      order: updated[mealIndex].foods.length,
    });
    setMeals(updated);
    setFoodSearch("");
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const updated = [...meals];
    updated[mealIndex].foods = updated[mealIndex].foods.filter((_, i) => i !== foodIndex);
    setMeals(updated);
  };

  const updateFoodQuantity = (mealIndex: number, foodIndex: number, quantity: number) => {
    const updated = [...meals];
    updated[mealIndex].foods[foodIndex].quantity = quantity;
    setMeals(updated);
  };

  const savePlan = async () => {
    if (!planName.trim()) return;
    setSaving(true);

    const macros = calcPlanMacros(meals);
    const payload = {
      name: planName,
      description: planDescription || null,
      totalCalories: macros.cal || null,
      totalProtein: macros.prot || null,
      totalCarbs: macros.carb || null,
      totalFat: macros.fat || null,
      goal: planGoal || null,
      meals: meals.map((m, idx) => ({
        name: m.name,
        time: m.time || null,
        order: idx,
        notes: m.notes || null,
        foods: m.foods.map((f, fIdx) => ({
          foodId: f.foodId,
          quantity: f.quantity,
          unit: f.unit,
          notes: f.notes || null,
          order: fIdx,
        })),
      })),
    };

    try {
      const url = editingPlan ? `/api/nutrition/${editingPlan.id}` : "/api/nutrition";
      const method = editingPlan ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowEditor(false);
        fetchPlans();
      }
    } catch {
      /* empty */
    }
    setSaving(false);
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
    if (res.ok) {
      setShowAssign(false);
      setAssignPlanId("");
      setAssignClientId("");
      fetchPlans();
    }
  };

  const getGoalLabel = (v: string | null) => goals.find((g) => g.value === v)?.label || v || "—";

  const filtered = plans.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchGoal = !goalFilter || p.goal === goalFilter;
    return matchSearch && matchGoal;
  });

  const filteredFoods = foodSearch.length >= 2
    ? allFoods.filter(
        (f) =>
          f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
          (f.brand && f.brand.toLowerCase().includes(foodSearch.toLowerCase()))
      ).slice(0, 15)
    : [];

  const catLabel: Record<string, string> = {
    protein: "Proteína",
    carbs: "HC",
    fats: "Gordura",
    vegetables: "Vegetal",
    fruits: "Fruta",
    dairy: "Laticínio",
    supplements: "Suplemento",
    other: "Outro",
  };

  // ==================== PLAN EDITOR (FULL SCREEN) ====================
  if (showEditor) {
    const macros = calcPlanMacros(meals);

    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {editingPlan ? "Editar Plano" : "Novo Plano de Nutrição"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-2">
              <span className="text-amber-600 font-medium">{macros.cal} kcal</span>
              <span className="text-red-600">P: {macros.prot}g</span>
              <span className="text-yellow-600">HC: {macros.carb}g</span>
              <span className="text-orange-600">G: {macros.fat}g</span>
            </div>
            <button onClick={savePlan} disabled={saving || !planName.trim()} className="btn-primary">
              <Save className="w-4 h-4" />
              {saving ? "A guardar..." : "Guardar Plano"}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nome do plano *</label>
                <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} className="input-field" placeholder="Ex: Plano de Cutting - João" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Objetivo</label>
                <select value={planGoal} onChange={(e) => setPlanGoal(e.target.value)} className="input-field">
                  <option value="">Selecionar objetivo</option>
                  {goals.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Descrição / Notas</label>
                <textarea value={planDescription} onChange={(e) => setPlanDescription(e.target.value)} className="input-field min-h-[60px]" placeholder="Notas para o atleta..." />
              </div>
            </div>
          </div>

          <div className="sm:hidden grid grid-cols-4 gap-2 mb-4">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Calorias</p>
              <p className="text-lg font-bold text-amber-600">{macros.cal}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Prot</p>
              <p className="text-lg font-bold text-red-600">{macros.prot}g</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">HC</p>
              <p className="text-lg font-bold text-yellow-600">{macros.carb}g</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Gord</p>
              <p className="text-lg font-bold text-orange-600">{macros.fat}g</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Refeições ({meals.length})</h2>
            </div>

            {meals.map((meal, mealIdx) => {
              const mealMacros = calcMealMacros(meal);
              const isActive = activeMealIndex === mealIdx;

              return (
                <div key={mealIdx} className={`card transition-all ${isActive ? "ring-2 ring-emerald-500" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setActiveMealIndex(isActive ? null : mealIdx)}>
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <input
                              type="text"
                              value={meal.name}
                              onChange={(e) => {
                                const updated = [...meals];
                                updated[mealIdx].name = e.target.value;
                                setMeals(updated);
                              }}
                              className="input-field text-sm font-semibold py-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <h3 className="text-sm font-semibold text-gray-900">{meal.name}</h3>
                          )}
                          {meal.time && !isActive && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {meal.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {mealMacros.cal} kcal | P:{mealMacros.prot}g HC:{mealMacros.carb}g G:{mealMacros.fat}g
                      </span>
                      <button onClick={() => removeMeal(mealIdx)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {isActive && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Hora</label>
                          <input
                            type="time"
                            value={meal.time}
                            onChange={(e) => {
                              const updated = [...meals];
                              updated[mealIdx].time = e.target.value;
                              setMeals(updated);
                            }}
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Notas</label>
                          <input
                            type="text"
                            value={meal.notes}
                            onChange={(e) => {
                              const updated = [...meals];
                              updated[mealIdx].notes = e.target.value;
                              setMeals(updated);
                            }}
                            className="input-field text-sm"
                            placeholder="Notas desta refeição..."
                          />
                        </div>
                      </div>

                      {meal.foods.length > 0 && (
                        <div className="space-y-2">
                          {meal.foods.map((mf, foodIdx) => {
                            const cal = Math.round((mf.food.calories * mf.quantity) / 100);
                            const prot = Math.round((mf.food.protein * mf.quantity) / 100);
                            return (
                              <div key={foodIdx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{mf.food.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {cal} kcal · {prot}g prot
                                    {mf.food.brand && ` · ${mf.food.brand}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={mf.quantity}
                                    onChange={(e) => updateFoodQuantity(mealIdx, foodIdx, parseFloat(e.target.value) || 0)}
                                    className="w-20 input-field text-sm text-center py-1"
                                    min={0}
                                    step={5}
                                  />
                                  <span className="text-xs text-gray-400 w-6">{mf.unit}</span>
                                  <button onClick={() => removeFoodFromMeal(mealIdx, foodIdx)} className="p-1 hover:bg-red-50 rounded-lg">
                                    <X className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={activeMealIndex === mealIdx ? foodSearch : ""}
                            onChange={(e) => setFoodSearch(e.target.value)}
                            onFocus={() => setActiveMealIndex(mealIdx)}
                            className="input-field pl-10 text-sm"
                            placeholder="Pesquisar alimento para adicionar..."
                          />
                        </div>
                        {filteredFoods.length > 0 && activeMealIndex === mealIdx && (
                          <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                            {filteredFoods.map((food) => (
                              <button
                                key={food.id}
                                onClick={() => addFoodToMeal(mealIdx, food)}
                                className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition flex items-center justify-between border-b border-gray-50 last:border-0"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{food.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {food.calories} kcal · P:{food.protein}g HC:{food.carbs}g G:{food.fat}g
                                    {food.brand && ` · ${food.brand}`}
                                  </p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  food.category === "protein" ? "bg-red-50 text-red-500" :
                                  food.category === "carbs" ? "bg-yellow-50 text-yellow-600" :
                                  food.category === "fats" ? "bg-orange-50 text-orange-500" :
                                  food.category === "vegetables" ? "bg-emerald-50 text-emerald-600" :
                                  food.category === "fruits" ? "bg-pink-50 text-pink-500" :
                                  food.category === "dairy" ? "bg-blue-50 text-blue-500" :
                                  food.category === "supplements" ? "bg-purple-50 text-purple-500" :
                                  "bg-gray-100 text-gray-500"
                                }`}>
                                  {catLabel[food.category] || food.category}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {meal.foods.length > 0 && (
                        <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between text-sm">
                          <span className="font-medium text-emerald-800">Total</span>
                          <span className="text-emerald-600 font-semibold text-xs">
                            {mealMacros.cal} kcal · P:{mealMacros.prot}g · HC:{mealMacros.carb}g · G:{mealMacros.fat}g
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {!isActive && meal.foods.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {meal.foods.map((mf, i) => (
                        <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                          {mf.food.name} ({mf.quantity}{mf.unit})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="card border-2 border-dashed border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-3">Adicionar Refeição</p>
              <div className="flex flex-wrap gap-2">
                {mealTemplates.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => addMeal(t)}
                    className="text-xs px-3 py-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Clock className="w-3 h-3" /> {t.name} ({t.time})
                  </button>
                ))}
                <button
                  onClick={() => addMeal()}
                  className="text-xs px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" /> Personalizada
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PLAN LIST ====================
  return (
    <div>
      <PageHeader
        title="Planos de Nutrição"
        description={`${plans.length} plano(s) criado(s)`}
        action={
          <button onClick={openNewPlan} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Plano
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Pesquisar planos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)} className="input-field w-auto">
          <option value="">Todos os objetivos</option>
          {goals.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="w-8 h-8" />}
          title="Nenhum plano de nutrição"
          description="Cria o teu primeiro plano de nutrição com refeições e alimentos."
          action={
            <button onClick={openNewPlan} className="btn-primary">
              <Plus className="w-4 h-4" /> Criar Plano
            </button>
          }
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
                    {plan.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{plan.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEditPlan(plan)} className="p-2 hover:bg-gray-100 rounded-lg" title="Editar">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => duplicatePlan(plan)} className="p-2 hover:bg-gray-100 rounded-lg" title="Duplicar">
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => { setAssignPlanId(plan.id); setShowAssign(true); }} className="p-2 hover:bg-emerald-50 rounded-lg" title="Atribuir">
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-50 rounded-lg" title="Eliminar">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-3">
                {plan.totalCalories && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    {Math.round(plan.totalCalories)} kcal
                  </div>
                )}
                {plan.totalProtein && <span className="text-xs text-red-600">P: {Math.round(plan.totalProtein)}g</span>}
                {plan.totalCarbs && <span className="text-xs text-yellow-600">HC: {Math.round(plan.totalCarbs)}g</span>}
                {plan.totalFat && <span className="text-xs text-orange-600">G: {Math.round(plan.totalFat)}g</span>}
                {plan.goal && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Target className="w-3.5 h-3.5" /> {getGoalLabel(plan.goal)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Apple className="w-3.5 h-3.5" /> {plan.meals.length} refeição(ões)
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" /> {plan._count.assignments} cliente(s)
                </div>
              </div>

              {expandedPlan === plan.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {plan.meals.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma refeição — clica em editar para adicionar refeições.</p>
                  ) : (
                    plan.meals.map((meal) => {
                      const macros = calcMealMacros(meal);
                      return (
                        <div key={meal.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {meal.name}
                              {meal.time && (
                                <span className="text-gray-400 font-normal ml-2">
                                  <Clock className="w-3 h-3 inline mr-0.5" />
                                  {meal.time}
                                </span>
                              )}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {macros.cal} kcal · P:{macros.prot}g HC:{macros.carb}g G:{macros.fat}g
                            </span>
                          </div>
                          {meal.notes && (
                            <p className="text-xs text-gray-400 italic mb-2">{meal.notes}</p>
                          )}
                          {meal.foods.length === 0 ? (
                            <p className="text-xs text-gray-400">Sem alimentos</p>
                          ) : (
                            <div className="space-y-1.5">
                              {meal.foods.map((mf) => (
                                <div key={mf.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2">
                                  <div>
                                    <span className="text-gray-700 font-medium">{mf.food.name}</span>
                                    {mf.food.brand && (
                                      <span className="text-gray-400 ml-1">({mf.food.brand})</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-gray-500">
                                    <span>{mf.quantity}{mf.unit}</span>
                                    <span>{Math.round((mf.food.calories * mf.quantity) / 100)} kcal</span>
                                    <span className="text-red-500">{Math.round((mf.food.protein * mf.quantity) / 100)}g P</span>
                                  </div>
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

      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Atribuir Plano de Nutrição">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cliente *</label>
            <select
              value={assignClientId}
              onChange={(e) => setAssignClientId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Selecionar cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAssign(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Atribuir
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
