"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Calendar,
  CheckCircle,
  Target,
  GlassWater,
  Plus,
  Minus,
  Clock,
  Check,
} from "lucide-react";

interface MealFood {
  id: string;
  food: {
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
  };
  quantity: number;
  unit: string;
  notes: string | null;
}

interface Meal {
  id: string;
  name: string;
  time: string | null;
  notes: string | null;
  order: number;
  foods: MealFood[];
}

interface Assignment {
  id: string;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  nutritionPlan: {
    name: string;
    description: string | null;
    totalCalories: number | null;
    totalProtein: number | null;
    totalCarbs: number | null;
    totalFat: number | null;
    goal: string | null;
    meals: Meal[];
  };
}

const goalLabels: Record<string, string> = {
  muscle_gain: "Ganho Muscular",
  fat_loss: "Perda de Gordura",
  maintenance: "Manutenção",
  performance: "Performance",
  health: "Saúde Geral",
  weight_gain: "Aumento de Peso",
};

const catEmoji: Record<string, string> = {
  protein: "🥩",
  carbs: "🍚",
  fats: "🥑",
  vegetables: "🥦",
  fruits: "🍎",
  dairy: "🥛",
  supplements: "💊",
  other: "🍽️",
};

export default function AthleteNutritionPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [checkedMeals, setCheckedMeals] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem(`checkedMeals-${today}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [waterGlasses, setWaterGlasses] = useState(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().slice(0, 10);
      return parseInt(localStorage.getItem(`water-${today}`) || "0");
    }
    return 0;
  });
  const [showPastPlans, setShowPastPlans] = useState(false);

  useEffect(() => {
    fetch("/api/athlete/nutrition")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(setAssignments)
      .catch((err) => console.error("Nutrition fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Persist checked meals
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`checkedMeals-${today}`, JSON.stringify([...checkedMeals]));
  }, [checkedMeals]);

  // Persist water
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`water-${today}`, String(waterGlasses));
  }, [waterGlasses]);

  const toggleMealCheck = (mealId: string) => {
    setCheckedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) next.delete(mealId);
      else next.add(mealId);
      return next;
    });
  };

  const activePlan = assignments.find((a) => a.isActive);
  const pastPlans = assignments.filter((a) => !a.isActive);
  const sortedMeals = useMemo(
    () => activePlan?.nutritionPlan.meals.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || [],
    [activePlan]
  );

  // Calculate consumed macros based on checked meals
  const consumed = useMemo(() => {
    let cal = 0, prot = 0, carb = 0, fat = 0;
    sortedMeals.forEach((meal) => {
      if (checkedMeals.has(meal.id)) {
        meal.foods.forEach((mf) => {
          const factor = mf.quantity / 100;
          cal += mf.food.calories * factor;
          prot += mf.food.protein * factor;
          carb += mf.food.carbs * factor;
          fat += mf.food.fat * factor;
        });
      }
    });
    return { cal: Math.round(cal), prot: Math.round(prot), carb: Math.round(carb), fat: Math.round(fat) };
  }, [sortedMeals, checkedMeals]);

  // Determine current/next meal based on time
  const currentMealId = useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let closest: { id: string; diff: number } | null = null;

    for (const meal of sortedMeals) {
      if (!meal.time) continue;
      const [h, m] = meal.time.split(":").map(Number);
      const mealMinutes = h * 60 + m;
      const diff = mealMinutes - nowMinutes;
      // Find the next upcoming or most recently past meal (within 30 min)
      if (diff >= -30 && (!closest || diff < closest.diff)) {
        closest = { id: meal.id, diff };
      }
    }
    return closest?.id || null;
  }, [sortedMeals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const waterGoal = 8; // glasses per 250ml = 2L

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Nutrição</h1>
        <p className="text-gray-500 mt-1">O teu plano nutricional e refeições</p>
      </div>

      {activePlan ? (
        <div className="space-y-5">
          {/* Plan Header */}
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <UtensilsCrossed className="w-40 h-40 -mt-8 -mr-8" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <UtensilsCrossed className="w-6 h-6" />
                <h2 className="text-xl font-bold">{activePlan.nutritionPlan.name}</h2>
              </div>
              {activePlan.nutritionPlan.description && (
                <p className="text-orange-100 text-sm mb-3">{activePlan.nutritionPlan.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-orange-100">
                  <Calendar className="w-4 h-4" />
                  Desde {new Date(activePlan.startDate).toLocaleDateString("pt-PT")}
                </span>
                {activePlan.nutritionPlan.goal && (
                  <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-0.5 text-white text-xs font-medium">
                    <Target className="w-3 h-3" />
                    {goalLabels[activePlan.nutritionPlan.goal] || activePlan.nutritionPlan.goal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Progresso Diário</h3>
              <span className="text-xs text-gray-400">
                {checkedMeals.size}/{sortedMeals.length} refeições feitas
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MacroProgress
                label="Calorias"
                icon={<Flame className="w-4 h-4" />}
                current={consumed.cal}
                target={activePlan.nutritionPlan.totalCalories}
                unit="kcal"
                color="amber"
              />
              <MacroProgress
                label="Proteína"
                icon={<Beef className="w-4 h-4" />}
                current={consumed.prot}
                target={activePlan.nutritionPlan.totalProtein}
                unit="g"
                color="red"
              />
              <MacroProgress
                label="Hidratos"
                icon={<Wheat className="w-4 h-4" />}
                current={consumed.carb}
                target={activePlan.nutritionPlan.totalCarbs}
                unit="g"
                color="blue"
              />
              <MacroProgress
                label="Gordura"
                icon={<Droplets className="w-4 h-4" />}
                current={consumed.fat}
                target={activePlan.nutritionPlan.totalFat}
                unit="g"
                color="orange"
              />
            </div>
          </div>

          {/* Water Tracker */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GlassWater className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Água</h3>
              </div>
              <span className="text-xs text-gray-400">{waterGlasses * 250}ml / {waterGoal * 250}ml</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <Minus className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex-1 flex items-center gap-1">
                {Array.from({ length: waterGoal }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-6 rounded-full transition-all duration-300 ${
                      i < waterGlasses
                        ? "bg-blue-400"
                        : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setWaterGlasses(Math.min(waterGoal + 4, waterGlasses + 1))}
                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Refeições do Dia
            </h3>
            {sortedMeals.map((meal) => {
              const isChecked = checkedMeals.has(meal.id);
              const isCurrent = currentMealId === meal.id;
              const totalCal = meal.foods.reduce((sum, f) => sum + (f.food.calories * f.quantity) / 100, 0);
              const totalProt = meal.foods.reduce((sum, f) => sum + (f.food.protein * f.quantity) / 100, 0);
              const totalCarb = meal.foods.reduce((sum, f) => sum + (f.food.carbs * f.quantity) / 100, 0);
              const totalFat = meal.foods.reduce((sum, f) => sum + (f.food.fat * f.quantity) / 100, 0);
              const isExpanded = expandedMeal === meal.id;

              return (
                <div
                  key={meal.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isChecked
                      ? "border-emerald-200 bg-emerald-50/30"
                      : isCurrent
                      ? "border-orange-300 ring-2 ring-orange-100"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center p-4 sm:p-5">
                    {/* Check button */}
                    <button
                      onClick={() => toggleMealCheck(meal.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 transition-all flex-shrink-0 ${
                        isChecked
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-gray-300 hover:border-emerald-400"
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4" />}
                    </button>

                    {/* Meal info */}
                    <button
                      onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                      className="flex items-center justify-between flex-1 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isChecked ? "bg-emerald-100" : isCurrent ? "bg-orange-100" : "bg-gray-100"
                        }`}>
                          <UtensilsCrossed className={`w-5 h-5 ${
                            isChecked ? "text-emerald-600" : isCurrent ? "text-orange-600" : "text-gray-400"
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${isChecked ? "text-emerald-700 line-through" : "text-gray-900"}`}>
                              {meal.name}
                            </h4>
                            {isCurrent && !isChecked && (
                              <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                AGORA
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {meal.time && (
                              <span className="inline-flex items-center gap-0.5 mr-2">
                                <Clock className="w-3 h-3" /> {meal.time}
                              </span>
                            )}
                            {meal.foods.length} alimentos · ~{Math.round(totalCal)} kcal
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                      {meal.notes && (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                          📝 {meal.notes}
                        </p>
                      )}
                      {meal.foods.map((mf) => {
                        const cal = Math.round((mf.food.calories * mf.quantity) / 100);
                        const prot = Math.round((mf.food.protein * mf.quantity) / 100);
                        const carb = Math.round((mf.food.carbs * mf.quantity) / 100);
                        const fat = Math.round((mf.food.fat * mf.quantity) / 100);
                        const fiber = mf.food.fiber ? Math.round((mf.food.fiber * mf.quantity) / 100) : null;

                        return (
                          <div key={mf.id} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{catEmoji[mf.food.category] || "🍽️"}</span>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{mf.food.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {mf.quantity}{mf.unit}
                                    {mf.food.brand && ` · ${mf.food.brand}`}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-amber-600">{cal} kcal</span>
                            </div>
                            <div className="flex gap-3 mt-2">
                              <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">P: {prot}g</span>
                              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">HC: {carb}g</span>
                              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">G: {fat}g</span>
                              {fiber !== null && fiber > 0 && (
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Fibra: {fiber}g</span>
                              )}
                            </div>
                            {mf.notes && (
                              <p className="text-xs text-gray-400 italic mt-2">{mf.notes}</p>
                            )}
                          </div>
                        );
                      })}
                      <div className="bg-orange-50 rounded-xl p-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium text-orange-800">Total da refeição</span>
                          <span className="text-orange-600 font-bold">{Math.round(totalCal)} kcal</span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="text-red-600">P: {Math.round(totalProt)}g</span>
                          <span className="text-yellow-600">HC: {Math.round(totalCarb)}g</span>
                          <span className="text-orange-600">G: {Math.round(totalFat)}g</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Sem plano nutricional</h3>
          <p className="text-gray-500 mt-2">O teu PT ainda não te atribuiu um plano nutricional.</p>
        </div>
      )}

      {/* Past Plans */}
      {pastPlans.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowPastPlans(!showPastPlans)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            {showPastPlans ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="font-semibold">Planos Anteriores ({pastPlans.length})</span>
          </button>
          {showPastPlans &&
            pastPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between opacity-60"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{plan.nutritionPlan.name}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(plan.startDate).toLocaleDateString("pt-PT")}
                    {plan.endDate && ` — ${new Date(plan.endDate).toLocaleDateString("pt-PT")}`}
                  </p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    {plan.nutritionPlan.totalCalories && <span>{Math.round(plan.nutritionPlan.totalCalories)} kcal</span>}
                    {plan.nutritionPlan.goal && <span>{goalLabels[plan.nutritionPlan.goal] || plan.nutritionPlan.goal}</span>}
                    <span>{plan.nutritionPlan.meals.length} refeições</span>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function MacroProgress({
  label,
  icon,
  current,
  target,
  unit,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  current: number;
  target: number | null;
  unit: string;
  color: string;
}) {
  const t = target || 0;
  const pct = t > 0 ? Math.min(100, Math.round((current / t) * 100)) : 0;

  const colors: Record<string, { bg: string; fill: string; text: string; iconColor: string }> = {
    amber: { bg: "bg-amber-100", fill: "bg-amber-500", text: "text-amber-700", iconColor: "text-amber-500" },
    red: { bg: "bg-red-100", fill: "bg-red-500", text: "text-red-700", iconColor: "text-red-500" },
    blue: { bg: "bg-blue-100", fill: "bg-blue-500", text: "text-blue-700", iconColor: "text-blue-500" },
    orange: { bg: "bg-orange-100", fill: "bg-orange-500", text: "text-orange-700", iconColor: "text-orange-500" },
  };

  const c = colors[color];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`${c.iconColor}`}>{icon}</div>
        <span className="text-[10px] text-gray-400 font-medium">{pct}%</span>
      </div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${c.text}`}>
        {current}
        <span className="text-xs font-normal text-gray-400">
          {t > 0 ? ` / ${Math.round(t)}` : ""} {unit}
        </span>
      </p>
      {t > 0 && (
        <div className={`w-full h-1.5 ${c.bg} rounded-full mt-2`}>
          <div
            className={`h-full ${c.fill} rounded-full transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
