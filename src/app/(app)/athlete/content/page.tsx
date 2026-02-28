"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Video,
  Image,
  Link as LinkIcon,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  article: <FileText className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  link: <LinkIcon className="w-5 h-5" />,
};

const typeColors: Record<string, string> = {
  article: "bg-blue-50 text-blue-600",
  video: "bg-red-50 text-red-600",
  image: "bg-purple-50 text-purple-600",
  link: "bg-emerald-50 text-emerald-600",
};

export default function AthleteContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (filterType) params.set("type", filterType);

    fetch(`/api/athlete/content?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setContent(data.content || []);
        setCategories(data.categories || []);
        setTypes(data.types || []);
      })
      .catch((err) => console.error("Content fetch error:", err))
      .finally(() => setLoading(false));
  }, [filterCategory, filterType]);

  const filtered = content.filter((c) =>
    search ? c.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conteúdo</h1>
        <p className="text-gray-500 mt-1">Artigos, vídeos e recursos do teu PT</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Pesquisar conteúdo..."
          />
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        {types.length > 0 && (
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos os tipos</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
      </div>

      {/* Content Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition group"
            >
              {item.thumbnailUrl && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[item.type] || "bg-gray-50 text-gray-600"}`}>
                    {typeIcons[item.type] || <FileText className="w-4 h-4" />}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">{item.type}</span>
                  {item.category && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-auto">
                      {item.category}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                  {(item.url || item.fileUrl) && (
                    <a
                      href={item.url || item.fileUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1 font-medium"
                    >
                      Abrir <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Sem conteúdo disponível</h3>
          <p className="text-gray-500 mt-2">O teu PT ainda não publicou conteúdo.</p>
        </div>
      )}
    </div>
  );
}
