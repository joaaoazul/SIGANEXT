"use client";

import { useState } from "react";
import {
  Calculator,
  Droplets,
  Flame,
  Scale,
  Heart,
  Dumbbell,
  Target,
  Percent,
  X,
} from "lucide-react";

// =================== TYPES ===================
type ToolKey = "imc" | "water" | "macros" | "tmb" | "fcmax" | "1rm" | "bf" | "calories";

interface ToolDef {
  key: ToolKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverBorder: string;
  hoverBg: string;
}

const tools: ToolDef[] = [
  { key: "imc", label: "Calculadora IMC", description: "Índice de Massa Corporal", icon: <Scale className="w-5 h-5" />, color: "bg-blue-50 text-blue-600", hoverBorder: "hover:border-blue-200", hoverBg: "hover:bg-blue-50/50" },
  { key: "water", label: "Água Diária", description: "Ingestão de água recomendada", icon: <Droplets className="w-5 h-5" />, color: "bg-cyan-50 text-cyan-600", hoverBorder: "hover:border-cyan-200", hoverBg: "hover:bg-cyan-50/50" },
  { key: "macros", label: "Macronutrientes", description: "Distribuição de macros", icon: <Target className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600", hoverBorder: "hover:border-emerald-200", hoverBg: "hover:bg-emerald-50/50" },
  { key: "tmb", label: "TMB / BMR", description: "Taxa Metabólica Basal", icon: <Flame className="w-5 h-5" />, color: "bg-orange-50 text-orange-600", hoverBorder: "hover:border-orange-200", hoverBg: "hover:bg-orange-50/50" },
  { key: "fcmax", label: "FC Máxima", description: "Frequência cardíaca e zonas", icon: <Heart className="w-5 h-5" />, color: "bg-red-50 text-red-600", hoverBorder: "hover:border-red-200", hoverBg: "hover:bg-red-50/50" },
  { key: "1rm", label: "1RM", description: "Repetição máxima estimada", icon: <Dumbbell className="w-5 h-5" />, color: "bg-purple-50 text-purple-600", hoverBorder: "hover:border-purple-200", hoverBg: "hover:bg-purple-50/50" },
  { key: "bf", label: "% Gordura Corporal", description: "Estimativa por medidas", icon: <Percent className="w-5 h-5" />, color: "bg-amber-50 text-amber-600", hoverBorder: "hover:border-amber-200", hoverBg: "hover:bg-amber-50/50" },
  { key: "calories", label: "Calorias Diárias", description: "TDEE - Gasto calórico total", icon: <Calculator className="w-5 h-5" />, color: "bg-indigo-50 text-indigo-600", hoverBorder: "hover:border-indigo-200", hoverBg: "hover:bg-indigo-50/50" },
];

// =================== MAIN WIDGET ===================
export default function ToolsWidget() {
  const [activeTool, setActiveTool] = useState<ToolKey | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 p-5 pb-0">
          <Calculator className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-semibold text-gray-900">Ferramentas do PT</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tools.map((tool) => (
              <button
                key={tool.key}
                onClick={() => setActiveTool(tool.key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 ${tool.hoverBorder} ${tool.hoverBg} transition-all group text-left`}
              >
                <div className={`w-10 h-10 rounded-lg ${tool.color} flex items-center justify-center transition-colors`}>
                  {tool.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{tool.label}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{tool.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tool Modals */}
      {activeTool && (
        <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />
      )}
    </>
  );
}

// =================== MODAL WRAPPER ===================
function ToolModal({ tool, onClose }: { tool: ToolKey; onClose: () => void }) {
  const titles: Record<ToolKey, string> = {
    imc: "Calculadora de IMC",
    water: "Calculadora de Água Diária",
    macros: "Calculadora de Macronutrientes",
    tmb: "Taxa Metabólica Basal (TMB)",
    fcmax: "Frequência Cardíaca Máxima",
    "1rm": "Repetição Máxima (1RM)",
    bf: "% Gordura Corporal",
    calories: "Calorias Diárias (TDEE)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{titles[tool]}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          {tool === "imc" && <IMCCalculator />}
          {tool === "water" && <WaterCalculator />}
          {tool === "macros" && <MacrosCalculator />}
          {tool === "tmb" && <TMBCalculator />}
          {tool === "fcmax" && <FCMaxCalculator />}
          {tool === "1rm" && <OneRMCalculator />}
          {tool === "bf" && <BodyFatCalculator />}
          {tool === "calories" && <TDEECalculator />}
        </div>
      </div>
    </div>
  );
}

// =================== SHARED STYLES ===================
const inputCls = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
const selectCls = inputCls + " appearance-none";
const labelCls = "block text-sm font-medium text-gray-600 mb-1";
const btnCls = "w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition";

function ResultCard({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">{children}</div>;
}

// =================== 1. IMC ===================
function IMCCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<{ imc: number; category: string; color: string } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return;
    const imc = w / (h * h);
    let category = "";
    let color = "";
    if (imc < 18.5) { category = "Abaixo do peso"; color = "text-blue-600"; }
    else if (imc < 25) { category = "Peso normal"; color = "text-emerald-600"; }
    else if (imc < 30) { category = "Sobrepeso"; color = "text-yellow-600"; }
    else if (imc < 35) { category = "Obesidade grau I"; color = "text-orange-600"; }
    else if (imc < 40) { category = "Obesidade grau II"; color = "text-red-500"; }
    else { category = "Obesidade grau III"; color = "text-red-700"; }
    setResult({ imc, category, color });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Calcula o Índice de Massa Corporal com base no peso e altura.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Peso (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} placeholder="75" />
        </div>
        <div>
          <label className={labelCls}>Altura (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} placeholder="175" />
        </div>
      </div>
      <button onClick={calculate} className={btnCls}>Calcular IMC</button>
      {result && (
        <ResultCard>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{result.imc.toFixed(1)}</p>
            <p className={`text-sm font-semibold mt-1 ${result.color}`}>{result.category}</p>
          </div>
          <div className="mt-3">
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 via-yellow-400 via-orange-400 to-red-500 relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full shadow"
                style={{ left: `${Math.min(Math.max(((result.imc - 15) / 30) * 100, 0), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>15</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>45</span>
            </div>
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// =================== 2. ÁGUA DIÁRIA ===================
function WaterCalculator() {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [climate, setClimate] = useState("normal");
  const [result, setResult] = useState<{ liters: number; glasses: number } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    if (!w) return;
    let base = w * 0.035; // 35ml por kg
    if (activity === "light") base *= 1.0;
    else if (activity === "moderate") base *= 1.15;
    else if (activity === "intense") base *= 1.35;
    else if (activity === "extreme") base *= 1.5;
    if (climate === "hot") base *= 1.2;
    else if (climate === "very_hot") base *= 1.4;
    setResult({ liters: base, glasses: Math.ceil(base / 0.25) });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Calcula a quantidade ideal de água diária com base no peso, atividade e clima.</p>
      <div>
        <label className={labelCls}>Peso (kg)</label>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} placeholder="75" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Nível de Atividade</label>
          <select value={activity} onChange={e => setActivity(e.target.value)} className={selectCls}>
            <option value="light">Leve / Sedentário</option>
            <option value="moderate">Moderado</option>
            <option value="intense">Intenso</option>
            <option value="extreme">Muito Intenso</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Clima</label>
          <select value={climate} onChange={e => setClimate(e.target.value)} className={selectCls}>
            <option value="normal">Temperado / Normal</option>
            <option value="hot">Quente</option>
            <option value="very_hot">Muito Quente</option>
          </select>
        </div>
      </div>
      <button onClick={calculate} className={btnCls}>Calcular</button>
      {result && (
        <ResultCard>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-cyan-600">{result.liters.toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">Litros por dia</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-600">{result.glasses}</p>
              <p className="text-xs text-gray-500 mt-1">Copos (250ml)</p>
            </div>
          </div>
          <div className="flex gap-1 justify-center mt-2 flex-wrap">
            {Array.from({ length: Math.min(result.glasses, 16) }).map((_, i) => (
              <span key={i} className="text-lg">💧</span>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// =================== 3. MACROS ===================
function MacrosCalculator() {
  const [calories, setCalories] = useState("");
  const [goal, setGoal] = useState("maintain");
  const [result, setResult] = useState<{ protein: number; carbs: number; fat: number; totalCal: number } | null>(null);

  const calculate = () => {
    let cal = parseFloat(calories);
    if (!cal) return;
    // Adjust for goal
    if (goal === "cut") cal *= 0.8;
    else if (goal === "bulk") cal *= 1.15;
    else if (goal === "agressive_cut") cal *= 0.7;

    let proteinPct: number, carbsPct: number, fatPct: number;
    switch (goal) {
      case "cut":
      case "agressive_cut":
        proteinPct = 0.40; carbsPct = 0.30; fatPct = 0.30; break;
      case "bulk":
        proteinPct = 0.30; carbsPct = 0.45; fatPct = 0.25; break;
      default:
        proteinPct = 0.30; carbsPct = 0.40; fatPct = 0.30;
    }

    setResult({
      protein: Math.round((cal * proteinPct) / 4),
      carbs: Math.round((cal * carbsPct) / 4),
      fat: Math.round((cal * fatPct) / 9),
      totalCal: Math.round(cal),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Calcula a distribuição ideal de Proteína, Hidratos de Carbono e Gordura.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Calorias diárias (kcal)</label>
          <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className={inputCls} placeholder="2000" />
        </div>
        <div>
          <label className={labelCls}>Objetivo</label>
          <select value={goal} onChange={e => setGoal(e.target.value)} className={selectCls}>
            <option value="maintain">Manutenção</option>
            <option value="cut">Definição (-20%)</option>
            <option value="agressive_cut">Definição Agressiva (-30%)</option>
            <option value="bulk">Ganho Muscular (+15%)</option>
          </select>
        </div>
      </div>
      <button onClick={calculate} className={btnCls}>Calcular Macros</button>
      {result && (
        <ResultCard>
          <p className="text-center text-sm text-gray-500 mb-3">Total: <strong className="text-gray-900">{result.totalCal} kcal</strong></p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <p className="text-xl font-bold text-emerald-600">{result.protein}g</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Proteína</p>
              <p className="text-[10px] text-gray-300">{result.protein * 4} kcal</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xl font-bold text-blue-600">{result.carbs}g</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Hidratos</p>
              <p className="text-[10px] text-gray-300">{result.carbs * 4} kcal</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <p className="text-xl font-bold text-amber-600">{result.fat}g</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Gordura</p>
              <p className="text-[10px] text-gray-300">{result.fat * 9} kcal</p>
            </div>
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// =================== 4. TMB (BMR) ===================
function TMBCalculator() {
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [formula, setFormula] = useState("mifflin");
  const [result, setResult] = useState<{ tmb: number; formula: string } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !h || !a) return;

    let tmb: number;
    let formulaName: string;

    if (formula === "mifflin") {
      // Mifflin-St Jeor (more accurate)
      tmb = gender === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;
      formulaName = "Mifflin-St Jeor";
    } else {
      // Harris-Benedict
      tmb = gender === "male"
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
      formulaName = "Harris-Benedict";
    }

    setResult({ tmb, formula: formulaName });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Calcula as calorias que o corpo gasta em repouso absoluto.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Sexo</label>
          <select value={gender} onChange={e => setGender(e.target.value)} className={selectCls}>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Fórmula</label>
          <select value={formula} onChange={e => setFormula(e.target.value)} className={selectCls}>
            <option value="mifflin">Mifflin-St Jeor</option>
            <option value="harris">Harris-Benedict</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Peso (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} placeholder="75" />
        </div>
        <div>
          <label className={labelCls}>Altura (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} placeholder="175" />
        </div>
        <div>
          <label className={labelCls}>Idade</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputCls} placeholder="30" />
        </div>
      </div>
      <button onClick={calculate} className={btnCls}>Calcular TMB</button>
      {result && (
        <ResultCard>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{Math.round(result.tmb)} kcal</p>
            <p className="text-xs text-gray-500 mt-1">Calorias em repouso por dia</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Fórmula: {result.formula}</p>
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// =================== 5. FC MÁXIMA ===================
function FCMaxCalculator() {
  const [age, setAge] = useState("");
  const [result, setResult] = useState<{ fcmax: number; zones: { name: string; min: number; max: number; color: string; desc: string }[] } | null>(null);

  const calculate = () => {
    const a = parseInt(age);
    if (!a) return;
    const fcmax = 220 - a; // Fórmula de Karvonen
    const zones = [
      { name: "Zona 1 - Aquecimento", min: Math.round(fcmax * 0.50), max: Math.round(fcmax * 0.60), color: "bg-blue-100 text-blue-700", desc: "50-60% · Recuperação" },
      { name: "Zona 2 - Queima Gordura", min: Math.round(fcmax * 0.60), max: Math.round(fcmax * 0.70), color: "bg-emerald-100 text-emerald-700", desc: "60-70% · Fat burn" },
      { name: "Zona 3 - Aeróbica", min: Math.round(fcmax * 0.70), max: Math.round(fcmax * 0.80), color: "bg-yellow-100 text-yellow-700", desc: "70-80% · Resistência" },
      { name: "Zona 4 - Limiar Anaeróbico", min: Math.round(fcmax * 0.80), max: Math.round(fcmax * 0.90), color: "bg-orange-100 text-orange-700", desc: "80-90% · Performance" },
      { name: "Zona 5 - Máximo", min: Math.round(fcmax * 0.90), max: fcmax, color: "bg-red-100 text-red-700", desc: "90-100% · Sprint" },
    ];
    setResult({ fcmax, zones });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Calcula a FC máxima e as zonas de treino cardíaco (Fórmula de Karvonen: 220 - idade).</p>
      <div>
        <label className={labelCls}>Idade</label>
        <input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputCls} placeholder="30" />
      </div>
      <button onClick={calculate} className={btnCls}>Calcular</button>
      {result && (
        <ResultCard>
          <div className="text-center mb-3">
            <p className="text-3xl font-bold text-red-600">{result.fcmax} bpm</p>
            <p className="text-xs text-gray-500">FC Máxima</p>
          </div>
          <div className="space-y-1.5">
            {result.zones.map((z) => (
              <div key={z.name} className={`flex items-center justify-between px-3 py-2 rounded-lg ${z.color}`}>
                <div>
                  <p className="text-xs font-semibold">{z.name}</p>
                  <p className="text-[10px] opacity-70">{z.desc}</p>
                </div>
                <p className="text-sm font-bold">{z.min}-{z.max}</p>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// =================== 6. 1RM ===================
function OneRMCalculator() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState<{ oneRM: number; percentages: { pct: number; weight: number; reps: string }[] } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || !r || r < 1) return;

    // Fórmula de Brzycki
    const oneRM = r === 1 ? w : w * (36 / (37 - r));

    const percentages = [
      { pct: 100, weight: Math.round(oneRM), reps: "1" },
      { pct: 95, weight: Math.round(oneRM * 0.95), reps: "2" },
      { pct: 90, weight: Math.round(oneRM * 0.90), reps: "3-4" },
      { pct: 85, weight: Math.round(oneRM * 0.85), reps: "5-6" },
      { pct: 80, weight: Math.round(oneRM * 0.80), reps: "7-8" },
      { pct: 75, weight: Math.round(oneRM * 0.75), reps: "9-10" },
      { pct: 70, weight: Math.round(oneRM * 0.70), reps: "11-12" },
      { pct: 65, weight: Math.round(oneRM * 0.65), reps: "13-15" },
      { pct: 60, weight: Math.round(oneRM * 0.60), reps: "16-20" },
    ];

    setResult({ oneRM, percentages });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Estima a repetição máxima (1RM) com base no peso e repetições realizadas (Fórmula de Brzycki).</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Peso levantado (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} placeholder="100" />
        </div>
        <div>
          <label className={labelCls}>Repetições realizadas</label>
          <input type="number" value={reps} onChange={e => setReps(e.target.value)} className={inputCls} placeholder="8" min="1" max="30" />
        </div>
      </div>
      <button onClick={calculate} className={btnCls}>Calcular 1RM</button>
      {result && (
        <ResultCard>
          <div className="text-center mb-3">
            <p className="text-3xl font-bold text-purple-600">{Math.round(result.oneRM)} kg</p>
            <p className="text-xs text-gray-500">1RM Estimado</p>
          </div>
          <div className="space-y-1">
            {result.percentages.map((p) => (
              <div key={p.pct} className="flex items-center gap-2 text-xs">
                <span className="w-10 text-right font-semibold text-gray-500">{p.pct}%</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${p.pct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-700">
                    {p.weight} kg · {p.reps} reps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// =================== 7. % GORDURA CORPORAL ===================
function BodyFatCalculator() {
  const [gender, setGender] = useState("male");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [height, setHeight] = useState("");
  const [hip, setHip] = useState("");
  const [result, setResult] = useState<{ bf: number; category: string; color: string } | null>(null);

  const calculate = () => {
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const h = parseFloat(height);
    const hip_val = parseFloat(hip);
    if (!w || !n || !h) return;

    let bf: number;
    if (gender === "male") {
      // US Navy Method - Male
      bf = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
    } else {
      if (!hip_val) return;
      // US Navy Method - Female
      bf = 163.205 * Math.log10(w + hip_val - n) - 97.684 * Math.log10(h) - 78.387;
    }

    let category = "";
    let color = "";
    if (gender === "male") {
      if (bf < 6) { category = "Essencial"; color = "text-red-600"; }
      else if (bf < 14) { category = "Atlético"; color = "text-emerald-600"; }
      else if (bf < 18) { category = "Fitness"; color = "text-blue-600"; }
      else if (bf < 25) { category = "Aceitável"; color = "text-yellow-600"; }
      else { category = "Obesidade"; color = "text-red-600"; }
    } else {
      if (bf < 14) { category = "Essencial"; color = "text-red-600"; }
      else if (bf < 21) { category = "Atlético"; color = "text-emerald-600"; }
      else if (bf < 25) { category = "Fitness"; color = "text-blue-600"; }
      else if (bf < 32) { category = "Aceitável"; color = "text-yellow-600"; }
      else { category = "Obesidade"; color = "text-red-600"; }
    }

    setResult({ bf, category, color });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Estimativa pelo Método US Navy. Medidas em centímetros.</p>
      <div>
        <label className={labelCls}>Sexo</label>
        <select value={gender} onChange={e => setGender(e.target.value)} className={selectCls}>
          <option value="male">Masculino</option>
          <option value="female">Feminino</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Cintura (cm)</label>
          <input type="number" value={waist} onChange={e => setWaist(e.target.value)} className={inputCls} placeholder="85" />
        </div>
        <div>
          <label className={labelCls}>Pescoço (cm)</label>
          <input type="number" value={neck} onChange={e => setNeck(e.target.value)} className={inputCls} placeholder="37" />
        </div>
        <div>
          <label className={labelCls}>Altura (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} placeholder="175" />
        </div>
        {gender === "female" && (
          <div>
            <label className={labelCls}>Anca (cm)</label>
            <input type="number" value={hip} onChange={e => setHip(e.target.value)} className={inputCls} placeholder="95" />
          </div>
        )}
      </div>
      <button onClick={calculate} className={btnCls}>Calcular</button>
      {result && (
        <ResultCard>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600">{result.bf.toFixed(1)}%</p>
            <p className={`text-sm font-semibold mt-1 ${result.color}`}>{result.category}</p>
          </div>
        </ResultCard>
      )}
    </div>
  );
}

// =================== 8. TDEE (Calorias Diárias) ===================
function TDEECalculator() {
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState("1.55");
  const [result, setResult] = useState<{ tmb: number; tdee: number; cut: number; bulk: number } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    const act = parseFloat(activity);
    if (!w || !h || !a) return;

    // Mifflin-St Jeor
    const tmb = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    const tdee = tmb * act;

    setResult({
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      cut: Math.round(tdee * 0.8),
      bulk: Math.round(tdee * 1.15),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Calcula o gasto calórico total diário (TDEE) incluindo atividade física.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Sexo</label>
          <select value={gender} onChange={e => setGender(e.target.value)} className={selectCls}>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Idade</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputCls} placeholder="30" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Peso (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} placeholder="75" />
        </div>
        <div>
          <label className={labelCls}>Altura (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} placeholder="175" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Nível de Atividade</label>
        <select value={activity} onChange={e => setActivity(e.target.value)} className={selectCls}>
          <option value="1.2">Sedentário (pouco exercício)</option>
          <option value="1.375">Levemente ativo (1-3x/semana)</option>
          <option value="1.55">Moderado (3-5x/semana)</option>
          <option value="1.725">Muito ativo (6-7x/semana)</option>
          <option value="1.9">Extremamente ativo (2x/dia)</option>
        </select>
      </div>
      <button onClick={calculate} className={btnCls}>Calcular TDEE</button>
      {result && (
        <ResultCard>
          <div className="text-center mb-3">
            <p className="text-3xl font-bold text-indigo-600">{result.tdee} kcal</p>
            <p className="text-xs text-gray-500">Gasto Calórico Total Diário</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-lg p-2.5 border border-red-100">
              <p className="text-lg font-bold text-red-500">{result.cut}</p>
              <p className="text-[10px] text-gray-400">Definição (-20%)</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
              <p className="text-lg font-bold text-emerald-500">{result.tdee}</p>
              <p className="text-[10px] text-gray-400">Manutenção</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-blue-100">
              <p className="text-lg font-bold text-blue-500">{result.bulk}</p>
              <p className="text-[10px] text-gray-400">Volume (+15%)</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">TMB base: {result.tmb} kcal</p>
        </ResultCard>
      )}
    </div>
  );
}
