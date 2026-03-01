"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dumbbell, ChevronDown, ChevronUp, Play, Clock, RotateCcw,
  CheckCircle, Calendar, Pause, Square, ChevronRight, ChevronLeft,
  Timer, Trophy, X, Zap, SkipForward, Check, ArrowLeft,
  Flame, Activity,
} from "lucide-react";

// ==================== TYPES ====================

interface TrainingExercise {
  id: string;
  exercise: {
    id: string;
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
  rpe: number | null;
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

interface SetData {
  reps: string;
  weight: string;
  rpe: string;
  completed: boolean;
}

// ==================== HELPERS ====================

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const dayShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const muscleGroupColors: Record<string, string> = {
  chest: "from-red-500 to-red-600",
  back: "from-blue-500 to-blue-600",
  legs: "from-purple-500 to-purple-600",
  shoulders: "from-amber-500 to-amber-600",
  arms: "from-emerald-500 to-emerald-600",
  core: "from-orange-500 to-orange-600",
  cardio: "from-pink-500 to-pink-600",
  full_body: "from-indigo-500 to-indigo-600",
};

const muscleLabels: Record<string, string> = {
  chest: "Peito", back: "Costas", legs: "Pernas", shoulders: "Ombros",
  arms: "Braços", core: "Core", cardio: "Cardio", full_body: "Corpo Inteiro",
};

const difficultyLabels: Record<string, string> = {
  beginner: "Iniciante", intermediate: "Intermédio", advanced: "Avançado",
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getRpeColor(rpe: number): string {
  if (rpe <= 5) return "text-emerald-600 bg-emerald-50";
  if (rpe <= 7) return "text-amber-600 bg-amber-50";
  if (rpe <= 8.5) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

// ==================== TOAST ====================

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

// ==================== REST TIMER COMPONENT ====================

function RestTimer({ duration, onComplete, onSkip }: { duration: number; onComplete: () => void; onSkip: () => void }) {
  const [remaining, setRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining, isPaused, onComplete]);

  const progress = ((duration - remaining) / duration) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/90 flex items-center justify-center backdrop-blur-sm">
      <div className="text-center space-y-6 p-8">
        <p className="text-lg text-gray-300 font-medium">Tempo de Descanso</p>

        {/* Circular timer */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={remaining <= 5 ? "#ef4444" : "#10b981"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-5xl font-bold ${remaining <= 5 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {formatTime(remaining)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            {isPaused ? <Play className="w-6 h-6 text-white" /> : <Pause className="w-6 h-6 text-white" />}
          </button>
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-colors"
          >
            <SkipForward className="w-4 h-4" /> Avançar
          </button>
        </div>

        <button onClick={() => setRemaining(Math.max(0, remaining + 30))} className="text-sm text-gray-400 hover:text-white transition-colors">
          +30s
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function AthleteTrainingPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  // Live workout state
  const [isLive, setIsLive] = useState(false);
  const [liveWorkout, setLiveWorkout] = useState<Workout | null>(null);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [setsData, setSetsData] = useState<Record<string, SetData[]>>({});
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const workoutStartTime = useRef<Date | null>(null);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  // Workout timer
  useEffect(() => {
    if (!isLive || workoutCompleted) return;
    const timer = setInterval(() => setWorkoutTimer(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isLive, workoutCompleted]);

  // Fetch training data
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

  // ==================== LIVE WORKOUT HANDLERS ====================

  const startWorkout = async (workout: Workout) => {
    try {
      const res = await fetch("/api/athlete/training/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId: workout.id }),
      });
      if (!res.ok) throw new Error("Erro ao iniciar treino");
      const log = await res.json();

      const initialData: Record<string, SetData[]> = {};
      workout.exercises.forEach((ex) => {
        initialData[ex.id] = Array.from({ length: ex.sets }, () => ({
          reps: ex.reps,
          weight: ex.weight || "",
          rpe: ex.rpe ? String(ex.rpe) : "",
          completed: false,
        }));
      });

      setWorkoutLogId(log.id);
      setLiveWorkout(workout);
      setSetsData(initialData);
      setCurrentExerciseIdx(0);
      setCurrentSetIdx(0);
      setWorkoutTimer(0);
      setWorkoutCompleted(false);
      setIsLive(true);
      workoutStartTime.current = new Date();
    } catch (err) {
      console.error(err);
      showToast("Erro ao iniciar treino");
    }
  };

  const logSet = async (exerciseId: string, setNumber: number, data: SetData) => {
    if (!workoutLogId) return;
    try {
      await fetch("/api/athlete/training/logs/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutLogId,
          trainingExerciseId: exerciseId,
          setNumber: setNumber + 1,
          reps: data.reps,
          weight: data.weight,
          rpe: data.rpe,
          completed: data.completed,
        }),
      });
    } catch (err) {
      console.error("Error logging set:", err);
    }
  };

  const completeSet = async () => {
    if (!liveWorkout) return;

    const exercise = liveWorkout.exercises[currentExerciseIdx];
    const setData = setsData[exercise.id]?.[currentSetIdx];
    if (!setData) return;

    const updatedData = { ...setsData };
    updatedData[exercise.id] = [...updatedData[exercise.id]];
    updatedData[exercise.id][currentSetIdx] = { ...setData, completed: true };
    setSetsData(updatedData);

    await logSet(exercise.id, currentSetIdx, { ...setData, completed: true });
    showToast(`Série ${currentSetIdx + 1} registada!`);

    const isLastSet = currentSetIdx >= exercise.sets - 1;
    const isLastExercise = currentExerciseIdx >= liveWorkout.exercises.length - 1;

    if (isLastSet && isLastExercise) {
      await completeWorkout();
    } else if (isLastSet) {
      setCurrentExerciseIdx(currentExerciseIdx + 1);
      setCurrentSetIdx(0);
      setRestDuration(exercise.restSeconds);
      setShowRestTimer(true);
    } else {
      setCurrentSetIdx(currentSetIdx + 1);
      setRestDuration(exercise.restSeconds);
      setShowRestTimer(true);
    }
  };

  const completeWorkout = async () => {
    if (!workoutLogId) return;
    try {
      await fetch("/api/athlete/training/logs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: workoutLogId,
          completedAt: new Date().toISOString(),
          duration: workoutTimer,
        }),
      });
      setWorkoutCompleted(true);
    } catch (err) {
      console.error("Error completing workout:", err);
    }
  };

  const exitLiveMode = () => {
    setIsLive(false);
    setLiveWorkout(null);
    setWorkoutLogId(null);
    setWorkoutCompleted(false);
    setWorkoutTimer(0);
    setSetsData({});
  };

  const updateSetField = (exerciseId: string, setIdx: number, field: keyof SetData, value: string | boolean) => {
    setSetsData(prev => {
      const updated = { ...prev };
      updated[exerciseId] = [...(updated[exerciseId] || [])];
      updated[exerciseId][setIdx] = { ...updated[exerciseId][setIdx], [field]: value };
      return updated;
    });
  };

  // ==================== LOADING ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const activePlan = assignments.find((a) => a.isActive);
  const pastPlans = assignments.filter((a) => !a.isActive);

  // ==================== WORKOUT COMPLETE SCREEN ====================

  if (isLive && workoutCompleted && liveWorkout) {
    const totalSets = liveWorkout.exercises.reduce((s, e) => s + e.sets, 0);
    const completedSets = Object.values(setsData).reduce(
      (s, sets) => s + sets.filter(st => st.completed).length, 0
    );
    const totalVolume = Object.values(setsData).reduce((vol, sets) => {
      return vol + sets.reduce((sv, s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        return sv + (w * r);
      }, 0);
    }, 0);

    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <Trophy className="w-12 h-12 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Treino Concluído! 💪</h1>
            <p className="text-gray-500 mt-2">{liveWorkout.name}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{formatTime(workoutTimer)}</p>
              <p className="text-xs text-gray-400">Duração</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{completedSets}/{totalSets}</p>
              <p className="text-xs text-gray-400">Séries</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{totalVolume > 0 ? `${Math.round(totalVolume)}` : "—"}</p>
              <p className="text-xs text-gray-400">Volume (kg)</p>
            </div>
          </div>

          {/* Exercise summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumo dos Exercícios</h3>
            {liveWorkout.exercises.map((ex) => {
              const sets = setsData[ex.id] || [];
              const done = sets.filter(s => s.completed).length;
              return (
                <div key={ex.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${muscleGroupColors[ex.exercise.muscleGroup] || "from-gray-400 to-gray-500"} flex items-center justify-center`}>
                      <Dumbbell className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-800">{ex.exercise.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">{done}/{ex.sets} séries</span>
                    {done === ex.sets && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={exitLiveMode}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold transition-colors"
          >
            Voltar aos Treinos
          </button>
        </div>
        <Toast message={toast.message} show={toast.show} />
      </div>
    );
  }

  // ==================== LIVE WORKOUT MODE ====================

  if (isLive && liveWorkout) {
    const currentExercise = liveWorkout.exercises[currentExerciseIdx];
    const currentSets = setsData[currentExercise.id] || [];
    const totalExercises = liveWorkout.exercises.length;
    const overallProgress = liveWorkout.exercises.reduce((total, ex) => {
      const sets = setsData[ex.id] || [];
      return total + sets.filter(s => s.completed).length;
    }, 0);
    const totalSets = liveWorkout.exercises.reduce((s, e) => s + e.sets, 0);

    return (
      <div className="space-y-4 pb-24">
        {/* Rest timer overlay */}
        {showRestTimer && (
          <RestTimer
            duration={restDuration}
            onComplete={() => setShowRestTimer(false)}
            onSkip={() => setShowRestTimer(false)}
          />
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => { if (confirm("Sair do treino? O progresso será guardado.")) exitLiveMode(); }} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> Sair
          </button>
          <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-mono font-bold">{formatTime(workoutTimer)}</span>
          </div>
          <button
            onClick={() => { if (confirm("Concluir treino agora?")) completeWorkout(); }}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-full"
          >
            Concluir
          </button>
        </div>

        {/* Workout name and progress */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{liveWorkout.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(overallProgress / totalSets) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">{overallProgress}/{totalSets}</span>
          </div>
        </div>

        {/* Current exercise card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`bg-gradient-to-r ${muscleGroupColors[currentExercise.exercise.muscleGroup] || "from-gray-500 to-gray-600"} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70 font-medium">Exercício {currentExerciseIdx + 1} de {totalExercises}</p>
                <h2 className="text-lg font-bold mt-0.5">{currentExercise.exercise.name}</h2>
                <p className="text-sm text-white/80 mt-0.5">
                  {muscleLabels[currentExercise.exercise.muscleGroup] || currentExercise.exercise.muscleGroup}
                  {currentExercise.exercise.equipment ? ` • ${currentExercise.exercise.equipment}` : ""}
                </p>
              </div>
              {currentExercise.exercise.videoUrl && (
                <a
                  href={currentExercise.exercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Play className="w-5 h-5" />
                </a>
              )}
            </div>
            {currentExercise.notes && (
              <p className="text-xs text-white/60 mt-2 italic">💡 {currentExercise.notes}</p>
            )}
          </div>

          {/* Sets */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">
              <span className="w-12">Série</span>
              <span className="flex-1 text-center">Reps</span>
              <span className="flex-1 text-center">Peso (kg)</span>
              <span className="flex-1 text-center">RPE</span>
              <span className="w-10" />
            </div>

            {currentSets.map((setData, idx) => {
              const isCurrent = idx === currentSetIdx;
              const isCompleted = setData.completed;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-xl transition-all ${
                    isCurrent
                      ? "bg-emerald-50 border-2 border-emerald-200 shadow-sm"
                      : isCompleted
                      ? "bg-gray-50 border border-gray-100"
                      : "border border-gray-100"
                  }`}
                >
                  <div className="w-12">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? "bg-emerald-500 text-white" : isCurrent ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={setData.reps}
                      onChange={(e) => updateSetField(currentExercise.id, idx, "reps", e.target.value)}
                      className={`w-full text-center text-sm font-medium border rounded-lg py-2 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all ${
                        isCompleted ? "bg-gray-100 border-gray-200 text-gray-500" : "bg-white border-gray-200"
                      }`}
                      placeholder={currentExercise.reps}
                      disabled={isCompleted}
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={setData.weight}
                      onChange={(e) => updateSetField(currentExercise.id, idx, "weight", e.target.value)}
                      className={`w-full text-center text-sm font-medium border rounded-lg py-2 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all ${
                        isCompleted ? "bg-gray-100 border-gray-200 text-gray-500" : "bg-white border-gray-200"
                      }`}
                      placeholder={currentExercise.weight || "—"}
                      disabled={isCompleted}
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.5}
                      value={setData.rpe}
                      onChange={(e) => updateSetField(currentExercise.id, idx, "rpe", e.target.value)}
                      className={`w-full text-center text-sm font-medium border rounded-lg py-2 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all ${
                        isCompleted
                          ? `${setData.rpe ? getRpeColor(parseFloat(setData.rpe)) : "bg-gray-100"} border-gray-200`
                          : "bg-white border-gray-200"
                      }`}
                      placeholder={currentExercise.rpe ? String(currentExercise.rpe) : "—"}
                      disabled={isCompleted}
                    />
                  </div>

                  <div className="w-10">
                    {isCurrent && !isCompleted && (
                      <button
                        onClick={completeSet}
                        className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    {isCompleted && (
                      <div className="w-10 h-10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 pb-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> {currentExercise.sets}×{currentExercise.reps} programado</span>
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {currentExercise.restSeconds}s descanso</span>
            {currentExercise.rpe && <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> RPE {currentExercise.rpe}</span>}
          </div>
        </div>

        {/* Exercise navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentExerciseIdx > 0) {
                setCurrentExerciseIdx(currentExerciseIdx - 1);
                const prevEx = liveWorkout.exercises[currentExerciseIdx - 1];
                const prevSets = setsData[prevEx.id] || [];
                const lastCompletedIdx = prevSets.findLastIndex(s => s.completed);
                setCurrentSetIdx(lastCompletedIdx >= 0 ? Math.min(lastCompletedIdx + 1, prevEx.sets - 1) : 0);
              }
            }}
            disabled={currentExerciseIdx === 0}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded-xl text-sm font-medium text-gray-600 flex items-center justify-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <button
            onClick={() => {
              if (currentExerciseIdx < totalExercises - 1) {
                setCurrentExerciseIdx(currentExerciseIdx + 1);
                const nextEx = liveWorkout.exercises[currentExerciseIdx + 1];
                const nextSets = setsData[nextEx.id] || [];
                const lastCompletedIdx = nextSets.findLastIndex(s => s.completed);
                setCurrentSetIdx(lastCompletedIdx >= 0 ? Math.min(lastCompletedIdx + 1, nextEx.sets - 1) : 0);
              }
            }}
            disabled={currentExerciseIdx >= totalExercises - 1}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded-xl text-sm font-medium text-gray-600 flex items-center justify-center gap-1 transition-colors"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Exercise list overview */}
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {liveWorkout.exercises.map((ex, idx) => {
            const sets = setsData[ex.id] || [];
            const completedCount = sets.filter(s => s.completed).length;
            const isActive = idx === currentExerciseIdx;

            return (
              <button
                key={ex.id}
                onClick={() => {
                  setCurrentExerciseIdx(idx);
                  const lastCompleted = sets.findLastIndex(s => s.completed);
                  setCurrentSetIdx(lastCompleted >= 0 ? Math.min(lastCompleted + 1, ex.sets - 1) : 0);
                }}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                  isActive ? "bg-emerald-50" : "hover:bg-gray-50"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  completedCount === ex.sets
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {completedCount === ex.sets ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? "text-emerald-700" : "text-gray-800"}`}>{ex.exercise.name}</p>
                  <p className="text-xs text-gray-400">{completedCount}/{ex.sets} séries</p>
                </div>
                {completedCount > 0 && completedCount < ex.sets && (
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(completedCount / ex.sets) * 100}%` }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Toast message={toast.message} show={toast.show} />
      </div>
    );
  }

  // ==================== PLAN VIEW (DEFAULT) ====================

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
            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-emerald-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Desde {new Date(activePlan.startDate).toLocaleDateString("pt-PT")}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                {difficultyLabels[activePlan.trainingPlan.difficulty] || activePlan.trainingPlan.difficulty}
              </span>
              {activePlan.trainingPlan.goal && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  {activePlan.trainingPlan.goal.replace("_", " ")}
                </span>
              )}
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                {activePlan.trainingPlan.workouts.length} treino(s)
              </span>
            </div>
          </div>

          {/* Weekly View */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {dayNames.map((day, i) => {
              const workout = activePlan.trainingPlan.workouts.find((w) => w.dayOfWeek === i);
              const isToday = new Date().getDay() === i;
              return (
                <button
                  key={i}
                  onClick={() => workout && setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                  className={`p-2 sm:p-3 rounded-xl text-center transition ${
                    isToday
                      ? "bg-emerald-50 border-2 border-emerald-500"
                      : workout
                      ? "bg-white border border-gray-200 hover:border-emerald-300"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <p className={`text-[10px] sm:text-xs font-medium ${isToday ? "text-emerald-600" : "text-gray-500"}`}>
                    {dayShort[i]}
                  </p>
                  {workout ? (
                    <Dumbbell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mt-1 ${isToday ? "text-emerald-500" : "text-gray-400"}`} />
                  ) : (
                    <p className="text-xs text-gray-300 mt-1">—</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Workouts */}
          <div className="space-y-3">
            {activePlan.trainingPlan.workouts.map((workout) => {
              const isExpanded = expandedWorkout === workout.id;

              return (
                <div
                  key={workout.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${muscleGroupColors[workout.exercises[0]?.exercise.muscleGroup] || "from-emerald-500 to-emerald-600"} flex items-center justify-center`}>
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{workout.name}</h3>
                        <p className="text-xs text-gray-500">
                          {workout.dayOfWeek !== null && `${dayNames[workout.dayOfWeek]} • `}
                          {workout.exercises.length} exercícios
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); startWorkout(workout); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" /> Iniciar
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2.5 border-t border-gray-100 pt-4">
                      {workout.notes && (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                          📝 {workout.notes}
                        </p>
                      )}
                      {workout.exercises.map((te, i) => (
                        <div
                          key={te.id}
                          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl"
                        >
                          <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${muscleGroupColors[te.exercise.muscleGroup] || "from-gray-400 to-gray-500"} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-gray-900 text-sm">{te.exercise.name}</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                {muscleLabels[te.exercise.muscleGroup] || te.exercise.muscleGroup}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <RotateCcw className="w-3.5 h-3.5" />
                                {te.sets}×{te.reps}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {te.restSeconds}s
                              </span>
                              {te.weight && (
                                <span className="flex items-center gap-1 font-medium">
                                  {te.weight}kg
                                </span>
                              )}
                              {te.rpe && (
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRpeColor(te.rpe)}`}>
                                  <Zap className="w-3 h-3" /> RPE {te.rpe}
                                </span>
                              )}
                            </div>
                            {te.exercise.equipment && (
                              <p className="text-xs text-gray-400 mt-1">🏋️ {te.exercise.equipment}</p>
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

                      <button
                        onClick={() => startWorkout(workout)}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" /> Iniciar Treino ao Vivo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}