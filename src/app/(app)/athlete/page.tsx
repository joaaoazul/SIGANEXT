"use client";

import { useState, useEffect } from "react";
import {
  Dumbbell,
  UtensilsCrossed,
  CalendarDays,
  Target,
  Bell,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Heart,
  Zap,
  Moon,
  Brain,
  Flame,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  client: {
    id: string;
    name: string;
    avatar: string | null;
    primaryGoal: string | null;
    weight: number | null;
    targetWeight: number | null;
    paymentStatus: string;
    plan: string | null;
    planEndDate: string | null;
  };
  activeTrainingPlan: {
    trainingPlan: {
      name: string;
      workouts: {
        name: string;
        dayOfWeek: number | null;
        exercises: { exercise: { name: string; muscleGroup: string } }[];
      }[];
    };
  } | null;
  activeNutritionPlan: {
    nutritionPlan: {
      name: string;
      totalCalories: number | null;
      totalProtein: number | null;
      totalCarbs: number | null;
      totalFat: number | null;
      meals: { name: string; time: string | null; foods: { food: { name: string }; quantity: number; unit: string }[] }[];
    };
  } | null;
  upcomingBookings: {
    id: string;
    date: string;
    status: string;
    bookingSlot: { title: string; startTime: string; endTime: string; location: string | null };
  }[];
  todayCheckIn: {
    mood: number | null;
    energy: number | null;
    sleep: number | null;
    soreness: number | null;
    stress: number | null;
    trainedToday: boolean;
    followedDiet: boolean;
  } | null;
  recentCheckIns: {
    date: string;
    mood: number | null;
    energy: number | null;
    weight: number | null;
  }[];
  unreadNotifications: number;
  recentContent: { id: string; title: string; type: string; category: string | null }[];
}

const goalLabels: Record<string, string> = {
  weight_loss: "Perda de Peso",
  muscle_gain: "Ganho Muscular",
  maintenance: "Manutenção",
  performance: "Performance",
  health: "Saúde",
  rehabilitation: "Reabilitação",
};

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const moodEmojis = ["", "😞", "😐", "🙂", "😊", "🤩"];
const energyEmojis = ["", "🔋", "🔋", "⚡", "⚡", "🔥"];

export default function AthleteDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/athlete/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!data?.client) {
    return (
      <div className="text-center py-20 text-gray-500">
        Erro ao carregar dados. Tenta novamente.
      </div>
    );
  }

  const today = new Date().getDay();
  const todayWorkout = data.activeTrainingPlan?.trainingPlan.workouts.find(
    (w) => w.dayOfWeek === today
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Bem-vindo de volta</p>
            <h1 className="text-2xl font-bold mt-1">
              {data.client.name?.split(" ")[0]} 👋
            </h1>
            {data.client.primaryGoal && (
              <p className="text-emerald-100 mt-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Objetivo: {goalLabels[data.client.primaryGoal] || data.client.primaryGoal}
              </p>
            )}
          </div>
          {data.unreadNotifications > 0 && (
            <Link
              href="/athlete/settings"
              className="relative bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                {data.unreadNotifications}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat
          icon={<Dumbbell className="w-5 h-5" />}
          label="Plano de Treino"
          value={data.activeTrainingPlan ? "Ativo" : "Sem plano"}
          color={data.activeTrainingPlan ? "emerald" : "gray"}
          href="/athlete/training"
        />
        <QuickStat
          icon={<UtensilsCrossed className="w-5 h-5" />}
          label="Plano Nutricional"
          value={data.activeNutritionPlan ? "Ativo" : "Sem plano"}
          color={data.activeNutritionPlan ? "blue" : "gray"}
          href="/athlete/nutrition"
        />
        <QuickStat
          icon={<CalendarDays className="w-5 h-5" />}
          label="Próx. Sessão"
          value={data.upcomingBookings.length > 0
            ? new Date(data.upcomingBookings[0].date).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
            : "Nenhuma"
          }
          color={data.upcomingBookings.length > 0 ? "purple" : "gray"}
          href="/athlete/bookings"
        />
        <QuickStat
          icon={<TrendingUp className="w-5 h-5" />}
          label="Peso Atual"
          value={data.client.weight ? `${data.client.weight} kg` : "—"}
          color="amber"
          href="/athlete/progress"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Workout */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-500" />
              Treino de Hoje
            </h2>
            <Link
              href="/athlete/training"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver plano <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {todayWorkout ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{todayWorkout.name}</p>
              <div className="space-y-2">
                {todayWorkout.exercises.slice(0, 5).map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-medium">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{ex.exercise.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{ex.exercise.muscleGroup}</span>
                  </div>
                ))}
                {todayWorkout.exercises.length > 5 && (
                  <p className="text-xs text-gray-400">
                    +{todayWorkout.exercises.length - 5} exercícios
                  </p>
                )}
              </div>
            </div>
          ) : data.activeTrainingPlan ? (
            <div className="text-center py-6 text-gray-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Dia de descanso! 🧘</p>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhum plano atribuído ainda</p>
            </div>
          )}
        </div>

        {/* Today's Check-in */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              Check-in de Hoje
            </h2>
          </div>
          {data.todayCheckIn ? (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                <MetricBadge icon={<Heart className="w-3.5 h-3.5" />} label="Humor" value={data.todayCheckIn.mood} emoji={moodEmojis} />
                <MetricBadge icon={<Zap className="w-3.5 h-3.5" />} label="Energia" value={data.todayCheckIn.energy} emoji={energyEmojis} />
                <MetricBadge icon={<Moon className="w-3.5 h-3.5" />} label="Sono" value={data.todayCheckIn.sleep} />
                <MetricBadge icon={<Flame className="w-3.5 h-3.5" />} label="Dor" value={data.todayCheckIn.soreness} />
                <MetricBadge icon={<Brain className="w-3.5 h-3.5" />} label="Stress" value={data.todayCheckIn.stress} />
              </div>
              <div className="flex gap-3">
                {data.todayCheckIn.trainedToday && (
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                    ✅ Treinou
                  </span>
                )}
                {data.todayCheckIn.followedDiet && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    ✅ Dieta cumprida
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-3">Ainda não fizeste o check-in de hoje</p>
              <Link
                href="/athlete/progress"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Fazer Check-in
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-500" />
              Próximas Sessões
            </h2>
            <Link
              href="/athlete/bookings"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver agenda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {data.upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex flex-col items-center justify-center">
                    <span className="text-xs text-purple-400">
                      {dayNames[new Date(booking.date).getDay()]}
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {new Date(booking.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.bookingSlot.title}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.bookingSlot.startTime} - {booking.bookingSlot.endTime}
                      {booking.bookingSlot.location && ` • ${booking.bookingSlot.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma sessão agendada</p>
            </div>
          )}
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              Nutrição
            </h2>
            <Link
              href="/athlete/nutrition"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver plano <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {data.activeNutritionPlan ? (
            <div className="space-y-4">
              <p className="font-medium text-gray-900">
                {data.activeNutritionPlan.nutritionPlan.name}
              </p>
              <div className="grid grid-cols-4 gap-2">
                <MacroBadge
                  label="Kcal"
                  value={data.activeNutritionPlan.nutritionPlan.totalCalories}
                  color="amber"
                />
                <MacroBadge
                  label="Prot"
                  value={data.activeNutritionPlan.nutritionPlan.totalProtein}
                  unit="g"
                  color="red"
                />
                <MacroBadge
                  label="Carbs"
                  value={data.activeNutritionPlan.nutritionPlan.totalCarbs}
                  unit="g"
                  color="blue"
                />
                <MacroBadge
                  label="Gord"
                  value={data.activeNutritionPlan.nutritionPlan.totalFat}
                  unit="g"
                  color="yellow"
                />
              </div>
              <p className="text-xs text-gray-400">
                {data.activeNutritionPlan.nutritionPlan.meals.length} refeições no plano
              </p>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhum plano nutricional atribuído</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Content */}
      {data.recentContent.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Conteúdo Recente
            </h2>
            <Link
              href="/athlete/content"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.recentContent.map((content) => (
              <div
                key={content.id}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <span className="text-xs text-gray-400 uppercase">{content.type}</span>
                <p className="text-sm font-medium text-gray-900 mt-1">{content.title}</p>
                {content.category && (
                  <span className="text-xs text-emerald-600 mt-1 inline-block">
                    {content.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  href: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    gray: "bg-gray-50 text-gray-400",
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition group"
    >
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </Link>
  );
}

function MetricBadge({
  icon,
  label,
  value,
  emoji,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  emoji?: string[];
}) {
  return (
    <div className="text-center">
      <div className="w-full aspect-square rounded-xl bg-gray-50 flex items-center justify-center text-lg">
        {value && emoji ? emoji[value] : value ? `${value}/5` : "—"}
      </div>
      <p className="text-[10px] text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function MacroBadge({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number | null;
  unit?: string;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    amber: "bg-amber-50",
    red: "bg-red-50",
    blue: "bg-blue-50",
    yellow: "bg-yellow-50",
  };

  return (
    <div className={`${bgColors[color]} rounded-xl p-3 text-center`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-1">
        {value ? Math.round(value) : "—"}
        {value && unit && <span className="text-xs font-normal text-gray-400">{unit}</span>}
      </p>
    </div>
  );
}
