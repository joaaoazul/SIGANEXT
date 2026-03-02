"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  BookOpen,
  PenLine,
  Search,
  X,
  Trash2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Apple,
} from "lucide-react";

// ==================== TYPES ====================

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

interface CatalogueFood {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  brand: string | null;
  servingSize: number | null;
  servingUnit: string | null;
}

interface FoodLogEntry {
  id: string;
  foodId: string | null;
  food: CatalogueFood | null;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
}

interface FoodLog {
  id: string;
  mealType: string;
  name: string;
  time: string | null;
  notes: string | null;
  photos: string | null;
  entries: FoodLogEntry[];
}

interface DailyData {
  date: string;
  logs: FoodLog[];
  water: { totalMl: number };
  totals: { calories: number; protein: number; carbs: number; fat: number };
}

const goalLabels: Record<string, string> = {
  muscle_gain: "Ganho Muscular",
  fat_loss: "Perda de Gordura",
  maintenance: "Manutenção",
  performance: "Performance",
  health: "Saúde Geral",
  weight_gain: "Aumento de Peso",
};

const mealTypes = [
  { value: "breakfast", label: "Pequeno-almoço", emoji: "🌅", time: "07:30" },
  { value: "morning_snack", label: "Lanche da manhã", emoji: "🍎", time: "10:00" },
  { value: "lunch", label: "Almoço", emoji: "☀️", time: "12:30" },
  { value: "afternoon_snack", label: "Lanche da tarde", emoji: "🥤", time: "16:00" },
  { value: "dinner", label: "Jantar", emoji: "🌙", time: "19:30" },
  { value: "supper", label: "Ceia", emoji: "🌜", time: "22:00" },
  { value: "snack", label: "Snack", emoji: "🍪", time: "" },
];

const catEmoji: Record<string, string> = {
  "Proteínas": "🥩",
  "Cereais": "🍚",
  "Gorduras": "🥑",
  "Vegetais": "🥦",
  "Frutas": "🍎",
  "Laticínios": "🥛",
  "Suplementos": "💊",
  "Tubérculos": "🥔",
};

export default function AthleteNutritionPage() {
  const [tab, setTab] = useState<"diary" | "plan">("diary");
  // Plan data
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  // Diary data
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [diaryLoading, setDiaryLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  // Plan tab state
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [checkedMeals, setCheckedMeals] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem(`checkedMeals-${today}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [showPastPlans, setShowPastPlans] = useState(false);
  // Diary modal
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [addingMealType, setAddingMealType] = useState(mealTypes[0]);
  const [showFoodSearch, setShowFoodSearch] = useState<string | null>(null); // foodLogId
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CatalogueFood[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  // Custom food form
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customFood, setCustomFood] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", quantity: "100", unit: "g" });
  // Photo upload
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  // Load plan
  useEffect(() => {
    fetch("/api/athlete/nutrition")
      .then((res) => res.ok ? res.json() : [])
      .then(setAssignments)
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, []);

  // Load diary for selected date
  const loadDiary = useCallback(() => {
    setDiaryLoading(true);
    fetch(`/api/athlete/food-log?date=${selectedDate}`)
      .then((res) => res.ok ? res.json() : null)
      .then(setDailyData)
      .catch(() => {})
      .finally(() => setDiaryLoading(false));
  }, [selectedDate]);

  useEffect(() => { loadDiary(); }, [loadDiary]);

  // Persist checked meals
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`checkedMeals-${today}`, JSON.stringify([...checkedMeals]));
  }, [checkedMeals]);

  const toggleMealCheck = (mealId: string) => {
    setCheckedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) next.delete(mealId); else next.add(mealId);
      return next;
    });
  };

  const activePlan = assignments.find((a) => a.isActive);
  const pastPlans = assignments.filter((a) => !a.isActive);
  const sortedMeals = useMemo(
    () => activePlan?.nutritionPlan.meals.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || [],
    [activePlan]
  );

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

  const currentMealId = useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let closest: { id: string; diff: number } | null = null;
    for (const meal of sortedMeals) {
      if (!meal.time) continue;
      const [h, m] = meal.time.split(":").map(Number);
      const mealMinutes = h * 60 + m;
      const diff = mealMinutes - nowMinutes;
      if (diff >= -30 && (!closest || diff < closest.diff)) {
        closest = { id: meal.id, diff };
      }
    }
    return closest?.id || null;
  }, [sortedMeals]);

  // ── Diary actions ──
  const addMealLog = async () => {
    const res = await fetch("/api/athlete/food-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType: addingMealType.value,
        name: addingMealType.label,
        time: addingMealType.time || new Date().toTimeString().slice(0, 5),
        date: selectedDate,
      }),
    });
    if (res.ok) {
      setShowAddMeal(false);
      loadDiary();
    }
  };

  const deleteMealLog = async (id: string) => {
    if (!confirm("Apagar esta refeição?")) return;
    const res = await fetch(`/api/athlete/food-log/${id}`, { method: "DELETE" });
    if (res.ok) loadDiary();
  };

  const searchFoods = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    const res = await fetch(`/api/athlete/food-log/search?q=${encodeURIComponent(q)}`);
    if (res.ok) setSearchResults(await res.json());
    setSearchLoading(false);
  };

  const addFoodEntry = async (foodLogId: string, food: CatalogueFood) => {
    const res = await fetch("/api/athlete/food-log/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodLogId,
        foodId: food.id,
        name: food.name,
        quantity: food.servingSize || 100,
        unit: food.servingUnit || "g",
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
      }),
    });
    if (res.ok) {
      setShowFoodSearch(null);
      setSearchQuery("");
      setSearchResults([]);
      loadDiary();
    }
  };

  const addCustomFoodEntry = async (foodLogId: string) => {
    if (!customFood.name) return;
    const res = await fetch("/api/athlete/food-log/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodLogId,
        name: customFood.name,
        quantity: parseFloat(customFood.quantity) || 100,
        unit: customFood.unit || "g",
        calories: parseFloat(customFood.calories) || 0,
        protein: parseFloat(customFood.protein) || 0,
        carbs: parseFloat(customFood.carbs) || 0,
        fat: parseFloat(customFood.fat) || 0,
      }),
    });
    if (res.ok) {
      setShowCustomFood(false);
      setCustomFood({ name: "", calories: "", protein: "", carbs: "", fat: "", quantity: "100", unit: "g" });
      setShowFoodSearch(null);
      loadDiary();
    }
  };

  const deleteEntry = async (entryId: string) => {
    const res = await fetch(`/api/athlete/food-log/entries?id=${entryId}`, { method: "DELETE" });
    if (res.ok) loadDiary();
  };

  const addWater = async () => {
    await fetch("/api/athlete/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, amountMl: 250 }),
    });
    loadDiary();
  };

  const removeWater = async () => {
    await fetch(`/api/athlete/water?date=${selectedDate}`, { method: "DELETE" });
    loadDiary();
  };

  const uploadMealPhoto = async (foodLogId: string, file: File) => {
    setUploadingPhoto(foodLogId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `food-logs/${selectedDate}`);
      formData.append("label", "meal");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) return;
      const { url, path } = await uploadRes.json();

      // Get current photos
      const log = dailyData?.logs.find(l => l.id === foodLogId);
      const currentPhotos = log?.photos ? JSON.parse(log.photos) : [];
      currentPhotos.push({ url, path, label: "meal" });

      await fetch(`/api/athlete/food-log/${foodLogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: currentPhotos }),
      });
      loadDiary();
    } finally {
      setUploadingPhoto(null);
    }
  };

  // Navigate dates
  const goDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const waterGoal = 2000; // ml
  const waterCurrent = dailyData?.water?.totalMl || 0;
  const waterGlasses = Math.round(waterCurrent / 250);

  // Get targets from active plan (if any)
  const targets = activePlan?.nutritionPlan
    ? {
        calories: activePlan.nutritionPlan.totalCalories || 0,
        protein: activePlan.nutritionPlan.totalProtein || 0,
        carbs: activePlan.nutritionPlan.totalCarbs || 0,
        fat: activePlan.nutritionPlan.totalFat || 0,
      }
    : null;

  if (planLoading && diaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nutrição</h1>
        <p className="text-gray-500 mt-1 text-sm">Diário alimentar e plano nutricional</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab("diary")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "diary" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <PenLine className="w-4 h-4" />
          Diário
        </button>
        <button
          onClick={() => setTab("plan")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "plan" ? "bg-white text-orange-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Plano
        </button>
      </div>

      {/* ═══════════════ DIÁRIO TAB ═══════════════ */}
      {tab === "diary" && (
        <div className="space-y-5">
          {/* Date picker */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3">
            <button onClick={() => goDay(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center">
              <p className="font-semibold text-gray-900">
                {isToday ? "Hoje" : new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-PT", { weekday: "long" })}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => goDay(1)}
              disabled={isToday}
              className={`p-2 rounded-lg transition ${isToday ? "opacity-30" : "hover:bg-gray-100"}`}
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Daily macro summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Macros do Dia</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MacroProgress
                label="Calorias" icon={<Flame className="w-4 h-4" />}
                current={dailyData?.totals.calories || 0}
                target={targets?.calories || null} unit="kcal" color="amber"
              />
              <MacroProgress
                label="Proteína" icon={<Beef className="w-4 h-4" />}
                current={dailyData?.totals.protein || 0}
                target={targets?.protein || null} unit="g" color="red"
              />
              <MacroProgress
                label="Hidratos" icon={<Wheat className="w-4 h-4" />}
                current={dailyData?.totals.carbs || 0}
                target={targets?.carbs || null} unit="g" color="blue"
              />
              <MacroProgress
                label="Gordura" icon={<Droplets className="w-4 h-4" />}
                current={dailyData?.totals.fat || 0}
                target={targets?.fat || null} unit="g" color="orange"
              />
            </div>
          </div>

          {/* Water tracker */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GlassWater className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Água</h3>
              </div>
              <span className="text-xs text-gray-400">{waterCurrent}ml / {waterGoal}ml</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={removeWater} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                <Minus className="w-4 h-4 text-gray-500" />
              </button>
              <div className="flex-1 flex items-center gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-6 rounded-full transition-all duration-300 ${
                      i < waterGlasses ? "bg-blue-400" : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
              <button onClick={addWater} className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition">
                <Plus className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Meal logs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Refeições</h3>
              <button
                onClick={() => setShowAddMeal(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            {diaryLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
              </div>
            ) : dailyData?.logs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <Apple className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Ainda não registaste refeições hoje.</p>
                <button
                  onClick={() => setShowAddMeal(true)}
                  className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  + Registar primeira refeição
                </button>
              </div>
            ) : (
              dailyData?.logs.map((log) => {
                const mt = mealTypes.find(m => m.value === log.mealType);
                const isExpanded = expandedLog === log.id;
                const mealCal = log.entries.reduce((s, e) => s + (e.calories * e.quantity / 100), 0);
                const mealProt = log.entries.reduce((s, e) => s + (e.protein * e.quantity / 100), 0);
                const mealCarb = log.entries.reduce((s, e) => s + (e.carbs * e.quantity / 100), 0);
                const mealFat = log.entries.reduce((s, e) => s + (e.fat * e.quantity / 100), 0);
                const photos = log.photos ? JSON.parse(log.photos) : [];

                return (
                  <div key={log.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                      className="w-full flex items-center p-4 text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mr-3 text-lg">
                        {mt?.emoji || "🍽️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{log.name}</h4>
                          {log.time && (
                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {log.time}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {log.entries.length} alimento{log.entries.length !== 1 ? "s" : ""} · ~{Math.round(mealCal)} kcal
                          {photos.length > 0 && <span className="ml-1">📸 {photos.length}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2 hidden sm:block">
                          <span className="text-xs text-red-500">P:{Math.round(mealProt)}g</span>
                          <span className="text-xs text-yellow-500 ml-2">HC:{Math.round(mealCarb)}g</span>
                          <span className="text-xs text-orange-500 ml-2">G:{Math.round(mealFat)}g</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                        {/* Photos */}
                        {photos.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {photos.map((p: { url: string; label: string }, i: number) => (
                              <img key={i} src={p.url} alt={p.label} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                            ))}
                          </div>
                        )}

                        {/* Entries */}
                        {log.entries.map((entry) => {
                          const factor = entry.quantity / 100;
                          return (
                            <div key={entry.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-lg">{catEmoji[entry.food?.category || ""] || "🍽️"}</span>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">{entry.name}</p>
                                  <p className="text-xs text-gray-400">{entry.quantity}{entry.unit}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <span className="text-sm font-semibold text-amber-600">{Math.round(entry.calories * factor)} kcal</span>
                                  <div className="flex gap-2 mt-0.5">
                                    <span className="text-[10px] text-red-500">P:{Math.round(entry.protein * factor)}g</span>
                                    <span className="text-[10px] text-yellow-500">HC:{Math.round(entry.carbs * factor)}g</span>
                                    <span className="text-[10px] text-orange-500">G:{Math.round(entry.fat * factor)}g</span>
                                  </div>
                                </div>
                                <button onClick={() => deleteEntry(entry.id)} className="p-1 text-gray-300 hover:text-red-500 transition">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Meal total */}
                        {log.entries.length > 0 && (
                          <div className="bg-emerald-50 rounded-xl p-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-emerald-800">Total</span>
                              <span className="text-emerald-600 font-bold">{Math.round(mealCal)} kcal</span>
                            </div>
                            <div className="flex gap-4 text-xs mt-1">
                              <span className="text-red-600">P: {Math.round(mealProt)}g</span>
                              <span className="text-yellow-600">HC: {Math.round(mealCarb)}g</span>
                              <span className="text-orange-600">G: {Math.round(mealFat)}g</span>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowFoodSearch(log.id); setSearchQuery(""); setSearchResults([]); setShowCustomFood(false); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                          >
                            <Plus className="w-4 h-4" /> Adicionar alimento
                          </button>
                          <label className="flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer">
                            <Camera className="w-4 h-4" />
                            {uploadingPhoto === log.id ? "..." : "Foto"}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadMealPhoto(log.id, file);
                              }}
                            />
                          </label>
                          <button
                            onClick={() => deleteMealLog(log.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {log.notes && (
                          <p className="text-xs text-gray-400 italic">📝 {log.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ PLANO TAB ═══════════════ */}
      {tab === "plan" && (
        <div className="space-y-5">
          {activePlan ? (
            <>
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

              {/* Macro targets */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Targets do Plano</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <MacroProgress label="Calorias" icon={<Flame className="w-4 h-4" />}
                    current={consumed.cal} target={activePlan.nutritionPlan.totalCalories} unit="kcal" color="amber" />
                  <MacroProgress label="Proteína" icon={<Beef className="w-4 h-4" />}
                    current={consumed.prot} target={activePlan.nutritionPlan.totalProtein} unit="g" color="red" />
                  <MacroProgress label="Hidratos" icon={<Wheat className="w-4 h-4" />}
                    current={consumed.carb} target={activePlan.nutritionPlan.totalCarbs} unit="g" color="blue" />
                  <MacroProgress label="Gordura" icon={<Droplets className="w-4 h-4" />}
                    current={consumed.fat} target={activePlan.nutritionPlan.totalFat} unit="g" color="orange" />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {checkedMeals.size}/{sortedMeals.length} refeições do plano marcadas
                </p>
              </div>

              {/* Meals */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Refeições do Plano</h3>
                {sortedMeals.map((meal) => {
                  const isChecked = checkedMeals.has(meal.id);
                  const isCurrent = currentMealId === meal.id;
                  const totalCal = meal.foods.reduce((s, f) => s + (f.food.calories * f.quantity) / 100, 0);
                  const totalProt = meal.foods.reduce((s, f) => s + (f.food.protein * f.quantity) / 100, 0);
                  const totalCarb = meal.foods.reduce((s, f) => s + (f.food.carbs * f.quantity) / 100, 0);
                  const totalFat = meal.foods.reduce((s, f) => s + (f.food.fat * f.quantity) / 100, 0);
                  const isExp = expandedMeal === meal.id;

                  return (
                    <div key={meal.id} className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
                      isChecked ? "border-emerald-200 bg-emerald-50/30"
                        : isCurrent ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-100"
                    }`}>
                      <div className="flex items-center p-4 sm:p-5">
                        <button onClick={() => toggleMealCheck(meal.id)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 transition-all flex-shrink-0 ${
                            isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 hover:border-emerald-400"
                          }`}>
                          {isChecked && <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setExpandedMeal(isExp ? null : meal.id)}
                          className="flex items-center justify-between flex-1 text-left">
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
                                <h4 className={`font-semibold ${isChecked ? "text-emerald-700 line-through" : "text-gray-900"}`}>{meal.name}</h4>
                                {isCurrent && !isChecked && (
                                  <span className="text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">AGORA</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {meal.time && <span className="inline-flex items-center gap-0.5 mr-2"><Clock className="w-3 h-3" /> {meal.time}</span>}
                                {meal.foods.length} alimentos · ~{Math.round(totalCal)} kcal
                              </p>
                            </div>
                          </div>
                          {isExp ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                        </button>
                      </div>
                      {isExp && (
                        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                          {meal.notes && <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">📝 {meal.notes}</p>}
                          {meal.foods.map((mf) => {
                            const cal = Math.round((mf.food.calories * mf.quantity) / 100);
                            const prot = Math.round((mf.food.protein * mf.quantity) / 100);
                            const crb = Math.round((mf.food.carbs * mf.quantity) / 100);
                            const ft = Math.round((mf.food.fat * mf.quantity) / 100);
                            const fib = mf.food.fiber ? Math.round((mf.food.fiber * mf.quantity) / 100) : null;
                            return (
                              <div key={mf.id} className="bg-gray-50 rounded-xl p-3">
                                <div className="flex items-start justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{catEmoji[mf.food.category] || "🍽️"}</span>
                                    <div>
                                      <p className="font-medium text-gray-900 text-sm">{mf.food.name}</p>
                                      <p className="text-xs text-gray-400">{mf.quantity}{mf.unit}{mf.food.brand && ` · ${mf.food.brand}`}</p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-semibold text-amber-600">{cal} kcal</span>
                                </div>
                                <div className="flex gap-3 mt-2">
                                  <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">P: {prot}g</span>
                                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">HC: {crb}g</span>
                                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">G: {ft}g</span>
                                  {fib !== null && fib > 0 && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Fibra: {fib}g</span>}
                                </div>
                                {mf.notes && <p className="text-xs text-gray-400 italic mt-2">{mf.notes}</p>}
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
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Sem plano nutricional</h3>
              <p className="text-gray-500 mt-2">O teu PT ainda não te atribuiu um plano nutricional.</p>
              <p className="text-gray-400 mt-1 text-sm">Podes usar o Diário para registar as tuas refeições!</p>
            </div>
          )}

          {/* Past Plans */}
          {pastPlans.length > 0 && (
            <div className="space-y-3">
              <button onClick={() => setShowPastPlans(!showPastPlans)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
                {showPastPlans ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span className="font-semibold">Planos Anteriores ({pastPlans.length})</span>
              </button>
              {showPastPlans && pastPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between opacity-60">
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
      )}

      {/* ═══════════════ ADD MEAL MODAL ═══════════════ */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowAddMeal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Registar Refeição</h3>
              <button onClick={() => setShowAddMeal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {mealTypes.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => { setAddingMealType(mt); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${
                    addingMealType.value === mt.value ? "bg-emerald-50 border-2 border-emerald-300" : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <span className="text-2xl">{mt.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900">{mt.label}</p>
                    {mt.time && <p className="text-xs text-gray-400">{mt.time}</p>}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={addMealLog}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition"
              >
                Criar Refeição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ FOOD SEARCH MODAL ═══════════════ */}
      {showFoodSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => { setShowFoodSearch(null); setShowCustomFood(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Adicionar Alimento</h3>
              <button onClick={() => { setShowFoodSearch(null); setShowCustomFood(false); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {!showCustomFood ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar alimento (ex: frango, arroz...)"
                      value={searchQuery}
                      onChange={(e) => searchFoods(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px] max-h-[50vh]">
                  {searchLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                    </div>
                  ) : searchQuery.length < 2 ? (
                    <p className="text-center text-gray-400 text-sm py-8">Escreve pelo menos 2 letras para pesquisar</p>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">Nenhum alimento encontrado</p>
                      <button onClick={() => setShowCustomFood(true)} className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        + Adicionar manualmente
                      </button>
                    </div>
                  ) : (
                    searchResults.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => addFoodEntry(showFoodSearch, food)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl text-left transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{catEmoji[food.category] || "🍽️"}</span>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{food.name}</p>
                            <p className="text-xs text-gray-400">
                              {food.servingSize ? `${food.servingSize}${food.servingUnit || "g"}` : "100g"}
                              {food.brand && ` · ${food.brand}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-amber-600">{food.calories} kcal</p>
                          <p className="text-[10px] text-gray-400">P:{food.protein}g HC:{food.carbs}g G:{food.fat}g</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-gray-100">
                  <button onClick={() => setShowCustomFood(true)} className="w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                    Não encontras? Adicionar manualmente
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 space-y-3 overflow-y-auto">
                <input
                  type="text" placeholder="Nome do alimento *"
                  value={customFood.name} onChange={e => setCustomFood({...customFood, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Quantidade</label>
                    <input type="number" value={customFood.quantity} onChange={e => setCustomFood({...customFood, quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Unidade</label>
                    <select value={customFood.unit} onChange={e => setCustomFood({...customFood, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="g">gramas</option>
                      <option value="ml">ml</option>
                      <option value="unid">unidade</option>
                      <option value="colher">colher</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Calorias (kcal) /100g</label>
                    <input type="number" value={customFood.calories} onChange={e => setCustomFood({...customFood, calories: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Proteína (g) /100g</label>
                    <input type="number" value={customFood.protein} onChange={e => setCustomFood({...customFood, protein: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Hidratos (g) /100g</label>
                    <input type="number" value={customFood.carbs} onChange={e => setCustomFood({...customFood, carbs: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Gordura (g) /100g</label>
                    <input type="number" value={customFood.fat} onChange={e => setCustomFood({...customFood, fat: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowCustomFood(false)} className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                    Voltar
                  </button>
                  <button onClick={() => addCustomFoodEntry(showFoodSearch)} disabled={!customFood.name}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-40">
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MacroProgress({ label, icon, current, target, unit, color }: {
  label: string; icon: React.ReactNode; current: number; target: number | null; unit: string; color: string;
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
        <div className={c.iconColor}>{icon}</div>
        {t > 0 && <span className="text-[10px] text-gray-400 font-medium">{pct}%</span>}
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
          <div className={`h-full ${c.fill} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
