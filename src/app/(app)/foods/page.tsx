"use client";

import { useState, useEffect, useCallback } from "react";
import { Apple, Plus, Search, Filter, Edit, Trash2, Pill } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import Pagination from "@/components/Pagination";

interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  isSupplement: boolean;
  brand: string | null;
  servingSize: number | null;
  servingUnit: string | null;
}

const categories = [
  { value: "protein", label: "Proteínas" },
  { value: "carbs", label: "Hidratos de Carbono" },
  { value: "fats", label: "Gorduras" },
  { value: "vegetables", label: "Vegetais" },
  { value: "fruits", label: "Frutas" },
  { value: "dairy", label: "Laticínios" },
  { value: "supplements", label: "Suplementos" },
  { value: "other", label: "Outros" },
];

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editFood, setEditFood] = useState<Food | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{action: () => void; title: string; message: string} | null>(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    name: "", category: "protein", calories: "", protein: "", carbs: "", fat: "",
    fiber: "", sugar: "", sodium: "", isSupplement: false, brand: "", servingSize: "", servingUnit: "g",
  });

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await fetch(`/api/foods?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar alimentos");
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (e) { console.error(e); setFoods([]); }
    setLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editFood ? "PUT" : "POST";
    const url = editFood ? `/api/foods/${editFood.id}` : "/api/foods";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setEditFood(null);
      resetForm();
      fetchFoods();
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      title: "Confirmar",
      message: "Eliminar este alimento?",
      action: async () => {
        await fetch(`/api/foods/${id}`, { method: "DELETE" });
        fetchFoods();
      },
    });
  };

  const resetForm = () => {
    setForm({ name: "", category: "protein", calories: "", protein: "", carbs: "", fat: "", fiber: "", sugar: "", sodium: "", isSupplement: false, brand: "", servingSize: "", servingUnit: "g" });
  };

  const openEdit = (food: Food) => {
    setEditFood(food);
    setForm({
      name: food.name,
      category: food.category,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
      fiber: food.fiber?.toString() || "",
      sugar: "",
      sodium: "",
      isSupplement: food.isSupplement,
      brand: food.brand || "",
      servingSize: food.servingSize?.toString() || "",
      servingUnit: food.servingUnit || "g",
    });
    setShowModal(true);
  };

  const getCatLabel = (v: string) => categories.find(c => c.value === v)?.label || v;

  const catColors: Record<string, string> = {
    protein: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    carbs: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    fats: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    vegetables: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    fruits: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
    dairy: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    supplements: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    other: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  };

  return (
    <div>
      <PageHeader
        title="Base de Dados de Alimentos"
        description={`${foods.length} alimento(s) e suplemento(s)`}
        action={
          <button onClick={() => { resetForm(); setEditFood(null); setShowModal(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Alimento
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Pesquisar alimentos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field pl-10 pr-8 appearance-none">
            <option value="">Todas as categorias</option>
            {categories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          icon={<Apple className="w-8 h-8" />}
          title="Nenhum alimento encontrado"
          description="Adiciona alimentos e suplementos à tua base de dados."
          action={<button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary"><Plus className="w-4 h-4" /> Adicionar</button>}
        />
      ) : (
        <>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Alimento</th>
                <th className="text-left py-3 px-4">Categoria</th>
                <th className="text-right py-3 px-4">Calorias</th>
                <th className="text-right py-3 px-4">Proteína</th>
                <th className="text-right py-3 px-4">HC</th>
                <th className="text-right py-3 px-4">Gordura</th>
                <th className="text-right py-3 px-4">Fibra</th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {foods.slice((page - 1) * 20, page * 20).map((food) => (
                <tr key={food.id} className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {food.isSupplement && <Pill className="w-3.5 h-3.5 text-purple-600" />}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{food.name}</p>
                        {food.brand && <p className="text-xs text-gray-400">{food.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${catColors[food.category] || catColors.other}`}>
                      {getCatLabel(food.category)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">{food.calories} kcal</td>
                  <td className="py-3 px-4 text-right text-red-600">{food.protein}g</td>
                  <td className="py-3 px-4 text-right text-yellow-600">{food.carbs}g</td>
                  <td className="py-3 px-4 text-right text-orange-600">{food.fat}g</td>
                  <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">{food.fiber ?? "—"}g</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(food)} className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg">
                        <Edit className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button onClick={() => handleDelete(food.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={Math.ceil(foods.length / 20)} onPageChange={setPage} totalItems={foods.length} itemsPerPage={20} />
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditFood(null); resetForm(); }}
        title={editFood ? "Editar Alimento" : "Novo Alimento"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Categoria *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                {categories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" checked={form.isSupplement} onChange={(e) => setForm({ ...form, isSupplement: e.target.checked })} className="rounded border-gray-300" />
                Suplemento
              </label>
              {form.isSupplement && (
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field flex-1" placeholder="Marca" />
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Macronutrientes (por 100g)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Calorias (kcal) *</label>
                <input type="number" step="0.1" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Proteína (g) *</label>
                <input type="number" step="0.1" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">HC (g) *</label>
                <input type="number" step="0.1" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Gordura (g) *</label>
                <input type="number" step="0.1" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fibra (g)</label>
                <input type="number" step="0.1" value={form.fiber} onChange={(e) => setForm({ ...form, fiber: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Açúcar (g)</label>
                <input type="number" step="0.1" value={form.sugar} onChange={(e) => setForm({ ...form, sugar: e.target.value })} className="input-field" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Porção</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tamanho da porção</label>
                <input type="number" value={form.servingSize} onChange={(e) => setForm({ ...form, servingSize: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Unidade</label>
                <select value={form.servingUnit} onChange={(e) => setForm({ ...form, servingUnit: e.target.value })} className="input-field">
                  <option value="g">Gramas (g)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="unit">Unidade</option>
                  <option value="scoop">Scoop</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditFood(null); }} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editFood ? "Guardar" : "Criar Alimento"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => { confirmDialog?.action(); setConfirmDialog(null); }}
        title={confirmDialog?.title || ""}
        message={confirmDialog?.message || ""}
        variant="danger"
      />
    </div>
  );
}
