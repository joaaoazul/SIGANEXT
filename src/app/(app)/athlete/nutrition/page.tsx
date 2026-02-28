"use client";

import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface MealFood {
  id: string;
  food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    category: string;
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

export default function AthleteNutritionPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const activePlan = assignments.find((a) => a.isActive);
  const pastPlans = assignments.filter((a) => !a.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Nutrição</h1>
        <p className="text-gray-500 mt-1">O teu plano nutricional e refeições</p>
      </div>

      {activePlan ? (
        <div className="space-y-4">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <UtensilsCrossed className="w-6 h-6" />
              <h2 className="text-xl font-bold">{activePlan.nutritionPlan.name}</h2>
            </div>
            {activePlan.nutritionPlan.description && (
              <p className="text-orange-100 text-sm">{activePlan.nutritionPlan.description}</p>
            )}
            <div className="flex items-center gap-3 mt-4 text-sm">
              <span className="flex items-center gap-1 text-orange-100">
                <Calendar className="w-4 h-4" />
                Desde {new Date(activePlan.startDate).toLocaleDateString("pt-PT")}
              </span>
            </div>
          </div>

          {/* Macro Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MacroCard
              icon={<Flame className="w-5 h-5" />}
              label="Calorias"
              value={activePlan.nutritionPlan.totalCalories}
              unit="kcal"
              color="amber"
            />
            <MacroCard
              icon={<Beef className="w-5 h-5" />}
              label="Proteína"
              value={activePlan.nutritionPlan.totalProtein}
              unit="g"
              color="red"
            />
            <MacroCard
              icon={<Wheat className="w-5 h-5" />}
              label="Hidratos"
              value={activePlan.nutritionPlan.totalCarbs}
              unit="g"
              color="blue"
            />
            <MacroCard
              icon={<Droplets className="w-5 h-5" />}
              label="Gordura"
              value={activePlan.nutritionPlan.totalFat}
              unit="g"
              color="yellow"
            />
          </div>

          {/* Meals */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Refeições ({activePlan.nutritionPlan.meals.length})
            </h3>
            {activePlan.nutritionPlan.meals.map((meal) => {
              const totalCal = meal.foods.reduce(
                (sum, f) => sum + (f.food.calories * f.quantity) / 100,
                0
              );
              const totalProt = meal.foods.reduce(
                (sum, f) => sum + (f.food.protein * f.quantity) / 100,
                0
              );

              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                        <p className="text-xs text-gray-500">
                          {meal.time && `${meal.time} • `}
                          {meal.foods.length} alimentos • ~{Math.round(totalCal)} kcal
                        </p>
                      </div>
                    </div>
                    {expandedMeal === meal.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedMeal === meal.id && (
                    <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                      {meal.notes && (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                          📝 {meal.notes}
                        </p>
                      )}
                      {meal.foods.map((mf) => (
                        <div
                          key={mf.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{mf.food.name}</p>
                            <p className="text-xs text-gray-500">
                              {mf.quantity}{mf.unit} • {mf.food.category}
                            </p>
                            {mf.notes && (
                              <p className="text-xs text-gray-400 italic mt-1">{mf.notes}</p>
                            )}
                          </div>
                          <div className="text-right text-xs text-gray-500 space-y-0.5">
                            <p>{Math.round((mf.food.calories * mf.quantity) / 100)} kcal</p>
                            <p>{Math.round((mf.food.protein * mf.quantity) / 100)}g prot</p>
                          </div>
                        </div>
                      ))}
                      <div className="bg-orange-50 rounded-xl p-3 flex items-center justify-between text-sm">
                        <span className="font-medium text-orange-800">Total da refeição</span>
                        <span className="text-orange-600 font-semibold">
                          {Math.round(totalCal)} kcal • {Math.round(totalProt)}g prot
                        </span>
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
          <h2 className="text-lg font-semibold text-gray-900">Planos Anteriores</h2>
          {pastPlans.map((plan) => (
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
              </div>
              <CheckCircle className="w-5 h-5 text-gray-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MacroCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  unit: string;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    amber: { bg: "bg-amber-50", icon: "text-amber-500", text: "text-amber-700" },
    red: { bg: "bg-red-50", icon: "text-red-500", text: "text-red-700" },
    blue: { bg: "bg-blue-50", icon: "text-blue-500", text: "text-blue-700" },
    yellow: { bg: "bg-yellow-50", icon: "text-yellow-500", text: "text-yellow-700" },
  };

  const c = colorClasses[color];

  return (
    <div className={`${c.bg} rounded-2xl p-4`}>
      <div className={`${c.icon} mb-2`}>{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${c.text} mt-1`}>
        {value ? Math.round(value) : "—"}
        <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}
