"use client";

import { useState, useEffect } from "react";
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  Weight,
  RotateCcw,
  CheckCircle,
  Calendar,
} from "lucide-react";

interface TrainingExercise {
  id: string;
  exercise: {
    name: string;
    muscleGroup: string;
    equipment: string | null;
    videoUrl: string | null;
    instructions: string | null;
  };
  sets: number;
  reps: string;
  restSeconds: number;
  weight: string | null;
  notes: string | null;
}

interface Workout {
  id: string;
  name: string;
  dayOfWeek: number | null;
  notes: string | null;
  exercises: TrainingExercise[];
}

interface Assignment {
  id: string;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  trainingPlan: {
    name: string;
    description: string | null;
    duration: number | null;
    goal: string | null;
    difficulty: string;
    workouts: Workout[];
  };
}

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const muscleGroupColors: Record<string, string> = {
  chest: "bg-red-50 text-red-600",
  back: "bg-blue-50 text-blue-600",
  legs: "bg-purple-50 text-purple-600",
  shoulders: "bg-amber-50 text-amber-600",
  arms: "bg-emerald-50 text-emerald-600",
  core: "bg-orange-50 text-orange-600",
  cardio: "bg-pink-50 text-pink-600",
  full_body: "bg-indigo-50 text-indigo-600",
};

export default function AthleteTrainingPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/athlete/training")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(setAssignments)
      .catch((err) => console.error("Training fetch error:", err))
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
        <h1 className="text-2xl font-bold text-gray-900">Meu Treino</h1>
        <p className="text-gray-500 mt-1">O teu plano de treino atual e histórico</p>
      </div>

      {activePlan ? (
        <div className="space-y-4">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Dumbbell className="w-6 h-6" />
              <h2 className="text-xl font-bold">{activePlan.trainingPlan.name}</h2>
            </div>
            {activePlan.trainingPlan.description && (
              <p className="text-emerald-100 text-sm">{activePlan.trainingPlan.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-emerald-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Desde {new Date(activePlan.startDate).toLocaleDateString("pt-PT")}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium capitalize">
                {activePlan.trainingPlan.difficulty}
              </span>
              {activePlan.trainingPlan.goal && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  {activePlan.trainingPlan.goal}
                </span>
              )}
            </div>
          </div>

          {/* Weekly View */}
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day, i) => {
              const workout = activePlan.trainingPlan.workouts.find((w) => w.dayOfWeek === i);
              const isToday = new Date().getDay() === i;
              return (
                <button
                  key={i}
                  onClick={() => workout && setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                  className={`p-3 rounded-xl text-center transition ${
                    isToday
                      ? "bg-emerald-50 border-2 border-emerald-500"
                      : workout
                      ? "bg-white border border-gray-200 hover:border-emerald-300"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <p className={`text-xs font-medium ${isToday ? "text-emerald-600" : "text-gray-500"}`}>
                    {day.substring(0, 3)}
                  </p>
                  {workout ? (
                    <Dumbbell className={`w-4 h-4 mx-auto mt-1 ${isToday ? "text-emerald-500" : "text-gray-400"}`} />
                  ) : (
                    <p className="text-xs text-gray-300 mt-1">—</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Workouts */}
          <div className="space-y-3">
            {activePlan.trainingPlan.workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{workout.name}</h3>
                      <p className="text-xs text-gray-500">
                        {workout.dayOfWeek !== null && `${dayNames[workout.dayOfWeek]} • `}
                        {workout.exercises.length} exercícios
                      </p>
                    </div>
                  </div>
                  {expandedWorkout === workout.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedWorkout === workout.id && (
                  <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                    {workout.notes && (
                      <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                        📝 {workout.notes}
                      </p>
                    )}
                    {workout.exercises.map((te, i) => (
                      <div
                        key={te.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-gray-900">{te.exercise.name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${muscleGroupColors[te.exercise.muscleGroup] || "bg-gray-50 text-gray-600"}`}>
                              {te.exercise.muscleGroup}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <RotateCcw className="w-3.5 h-3.5" />
                              {te.sets} séries × {te.reps} reps
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {te.restSeconds}s descanso
                            </span>
                            {te.weight && (
                              <span className="flex items-center gap-1">
                                <Weight className="w-3.5 h-3.5" />
                                {te.weight}
                              </span>
                            )}
                          </div>
                          {te.exercise.equipment && (
                            <p className="text-xs text-gray-400 mt-1">
                              Equipamento: {te.exercise.equipment}
                            </p>
                          )}
                          {te.notes && (
                            <p className="text-xs text-gray-400 mt-1 italic">💡 {te.notes}</p>
                          )}
                          {te.exercise.videoUrl && (
                            <a
                              href={te.exercise.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-2 hover:underline"
                            >
                              <Play className="w-3 h-3" /> Ver vídeo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Sem plano de treino</h3>
          <p className="text-gray-500 mt-2">O teu PT ainda não te atribuiu um plano de treino.</p>
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
                <h3 className="font-medium text-gray-900">{plan.trainingPlan.name}</h3>
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
