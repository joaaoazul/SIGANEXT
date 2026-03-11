"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Search, Filter, Pencil, Trash2, Video, FileText, Link2, Eye, EyeOff, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import Pagination from "@/components/Pagination";

interface Content {
  id: string; title: string; description: string | null;
  type: string; category: string | null;
  url: string | null; thumbnailUrl: string | null;
  isPublished: boolean; createdAt: string;
}

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Content | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{action: () => void; title: string; message: string} | null>(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    title: "", description: "", type: "video", category: "", url: "", thumbnailUrl: "", isPublished: true,
  });

  const fetchContents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/content?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar conteúdo");
      const data = await res.json();
      setContents(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (e) { console.error(e); setContents([]); }
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", type: "video", category: "", url: "", thumbnailUrl: "", isPublished: true });
    setShowModal(true);
  };

  const openEdit = (c: Content) => {
    setEditing(c);
    setForm({
      title: c.title, description: c.description || "", type: c.type,
      category: c.category || "", url: c.url || "", thumbnailUrl: c.thumbnailUrl || "",
      isPublished: c.isPublished,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/content/${editing.id}` : "/api/content";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      fetchContents();
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      title: "Confirmar",
      message: "Eliminar este conteúdo?",
      action: async () => {
        await fetch(`/api/content/${id}`, { method: "DELETE" });
        fetchContents();
      },
    });
  };

  const typeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    video: { label: "Vídeo", icon: <Video className="w-4 h-4" />, color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    ebook: { label: "eBook", icon: <BookOpen className="w-4 h-4" />, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    article: { label: "Artigo", icon: <FileText className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    tutorial: { label: "Tutorial", icon: <BookOpen className="w-4 h-4" />, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    link: { label: "Link", icon: <Link2 className="w-4 h-4" />, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
  };

  return (
    <div>
      <PageHeader
        title="Conteúdos"
        description={`${contents.length} conteúdo(s)`}
        action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Novo Conteúdo</button>}
      />

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Pesquisar..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative w-40">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field pl-10 appearance-none">
            <option value="">Todos</option>
            <option value="video">Vídeos</option>
            <option value="ebook">eBooks</option>
            <option value="article">Artigos</option>
            <option value="tutorial">Tutoriais</option>
            <option value="link">Links</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contents.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="Sem conteúdos"
          description="Adicione vídeos, eBooks, artigos e tutoriais para os seus clientes."
          action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Novo Conteúdo</button>}
        />
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contents.slice((page - 1) * 20, page * 20).map((c) => {
            const t = typeLabels[c.type] || typeLabels.link;
            return (
              <div key={c.id} className="card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                {c.thumbnailUrl && (
                  <div className="w-full h-36 rounded-lg bg-gray-50 dark:bg-gray-800/50 mb-3 overflow-hidden">
                    <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{c.title}</h3>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg">
                      <Pencil className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
                {c.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{c.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`badge flex items-center gap-1 ${t.color}`}>
                      {t.icon} {t.label}
                    </span>
                    {c.category && <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">{c.category}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.isPublished ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />}
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded">
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Pagination currentPage={page} totalPages={Math.ceil(contents.length / 20)} onPageChange={setPage} totalItems={contents.length} itemsPerPage={20} />
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Editar Conteúdo" : "Novo Conteúdo"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Título *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tipo *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="video">Vídeo</option>
                <option value="ebook">eBook</option>
                <option value="article">Artigo</option>
                <option value="tutorial">Tutorial</option>
                <option value="link">Link</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="Ex: Nutrição, Treino..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">URL</label>
            <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Thumbnail URL</label>
            <input type="url" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 rounded" />
            <label htmlFor="isPublished" className="text-sm text-gray-600 dark:text-gray-400">Visível para clientes</label>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editing ? "Guardar" : "Criar"}</button>
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
