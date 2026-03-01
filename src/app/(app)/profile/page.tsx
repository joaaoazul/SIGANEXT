"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  MapPin,
  Calendar,
  Users,
  Dumbbell,
  UtensilsCrossed,
  ClipboardList,
  Edit3,
  Save,
  X,
  Instagram,
  Globe,
  Linkedin,
  Facebook,
  Award,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  specialties: string | null;
  location: string | null;
  socialLinks: SocialLinks | null;
  role: string;
  createdAt: string;
  // PT stats
  height?: number | null;
  weight?: number | null;
  primaryGoal?: string | null;
  trainingExperience?: string | null;
  activityLevel?: string | null;
  stats: Record<string, number>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Editable fields
  const [form, setForm] = useState({
    name: "",
    bio: "",
    specialties: "",
    location: "",
    phone: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    website: "",
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setForm({
          name: data.name || "",
          bio: data.bio || "",
          specialties: data.specialties || "",
          location: data.location || "",
          phone: data.phone || "",
          instagram: data.socialLinks?.instagram || "",
          facebook: data.socialLinks?.facebook || "",
          linkedin: data.socialLinks?.linkedin || "",
          website: data.socialLinks?.website || "",
        });
      } else {
        setErrorDetail(data?.details || data?.error || `Status ${res.status}`);
      }
    } catch (err) {
      setErrorDetail(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = isAthlete
        ? { name: form.name, phone: form.phone }
        : {
            name: form.name,
            bio: form.bio,
            specialties: form.specialties,
            location: form.location,
            phone: form.phone,
            socialLinks: {
              instagram: form.instagram || undefined,
              facebook: form.facebook || undefined,
              linkedin: form.linkedin || undefined,
              website: form.website || undefined,
            },
          };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage("Perfil atualizado!");
        setEditing(false);
        fetchProfile();
      } else {
        setMessage("Erro ao atualizar");
      }
    } catch {
      setMessage("Erro ao atualizar");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleImageUpload = async (
    file: File,
    type: "avatar" | "cover"
  ) => {
    if (type === "avatar") setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `profile/${profile?.id}`);
      formData.append("label", type);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      // Update profile with new image
      const updateBody: Record<string, string> = {};
      if (type === "avatar") updateBody.avatar = url;
      else updateBody.coverImage = url;

      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });

      fetchProfile();
      setMessage(type === "avatar" ? "Foto atualizada!" : "Capa atualizada!");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Erro ao carregar imagem");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const isAthlete = profile?.role === "client";

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-PT", {
        month: "long",
        year: "numeric",
      })
    : "";

  const specialtiesList = profile?.specialties
    ? profile.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PT";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
        <p className="text-gray-500">Erro ao carregar perfil</p>
        {errorDetail && (
          <p className="text-xs text-red-400 max-w-md text-center">{errorDetail}</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto -mt-2">
      {/* Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all ${
            message.includes("Erro")
              ? "bg-red-500 text-white"
              : "bg-emerald-500 text-white"
          }`}
        >
          {message}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, "avatar");
          e.target.value = "";
        }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, "cover");
          e.target.value = "";
        }}
      />

      {/* Back + Edit buttons */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Link>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Perfil
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

      {/* Cover Image */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 h-48 sm:h-56">
        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Change cover button — PT only */}
        {!isAthlete && (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-lg transition"
          >
            <Camera className="w-3.5 h-3.5" />
            {uploadingCover ? "A carregar..." : "Alterar capa"}
          </button>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 sm:px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4 flex items-end gap-4">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Name + role badge */}
          <div className="pb-1">
            {editing ? (
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-emerald-300 focus:border-emerald-500 outline-none pb-0.5"
                placeholder="O seu nome"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.name}
              </h1>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                isAthlete
                  ? "text-blue-700 bg-blue-100"
                  : "text-emerald-700 bg-emerald-100"
              }`}>
                <Award className="w-3 h-3" />
                {isAthlete ? "Atleta" : "Personal Trainer"}
              </span>
              {profile.location && !editing && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                Desde {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className={`grid grid-cols-2 ${isAthlete ? "sm:grid-cols-3" : "sm:grid-cols-4"} gap-3 mb-6`}>
          {(isAthlete
            ? [
                {
                  label: "Treinos",
                  value: profile.stats.totalWorkouts || 0,
                  icon: Dumbbell,
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  label: "Check-ins",
                  value: profile.stats.totalCheckins || 0,
                  icon: ClipboardList,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  label: "Planos Ativos",
                  value: profile.stats.activePlans || 0,
                  icon: Users,
                  color: "text-purple-600 bg-purple-50",
                },
              ]
            : [
                {
                  label: "Atletas",
                  value: profile.stats.activeClients || 0,
                  sub: `/ ${profile.stats.totalClients || 0} total`,
                  icon: Users,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  label: "Planos Treino",
                  value: profile.stats.totalPlans || 0,
                  icon: ClipboardList,
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  label: "Planos Nutrição",
                  value: profile.stats.totalNutritionPlans || 0,
                  icon: UtensilsCrossed,
                  color: "text-orange-600 bg-orange-50",
                },
                {
                  label: "Exercícios",
                  value: profile.stats.totalExercises || 0,
                  icon: Dumbbell,
                  color: "text-purple-600 bg-purple-50",
                },
              ]
          ).map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:shadow-sm transition"
            >
              <div
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${stat.color} mb-1.5`}
              >
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">
                {stat.label}
                {stat.sub && (
                  <span className="text-gray-300 ml-0.5">{stat.sub}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bio + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bio — PT only */}
            {!isAthlete && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Sobre mim
                </h3>
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none resize-none"
                    placeholder="Escreva algo sobre si, a sua experiência, filosofia de treino..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profile.bio || (
                      <span className="italic text-gray-300">
                        Ainda não adicionou uma bio. Clique em &quot;Editar
                        Perfil&quot; para começar.
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Athlete info card */}
            {isAthlete && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Os Meus Dados
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {profile.height && (
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Altura</p>
                      <p className="text-sm font-semibold text-gray-700">{profile.height} cm</p>
                    </div>
                  )}
                  {profile.weight && (
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Peso</p>
                      <p className="text-sm font-semibold text-gray-700">{profile.weight} kg</p>
                    </div>
                  )}
                  {profile.primaryGoal && (
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Objetivo</p>
                      <p className="text-sm font-semibold text-gray-700 capitalize">{profile.primaryGoal.replace(/_/g, " ")}</p>
                    </div>
                  )}
                  {profile.activityLevel && (
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Nível de Atividade</p>
                      <p className="text-sm font-semibold text-gray-700 capitalize">{profile.activityLevel.replace(/_/g, " ")}</p>
                    </div>
                  )}
                  {profile.trainingExperience && (
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Experiência</p>
                      <p className="text-sm font-semibold text-gray-700 capitalize">{profile.trainingExperience}</p>
                    </div>
                  )}
                </div>
                {!profile.height && !profile.weight && !profile.primaryGoal && (
                  <p className="text-sm text-gray-300 italic">Dados ainda não preenchidos</p>
                )}
              </div>
            )}

            {/* Specialties — PT only */}
            {!isAthlete && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Especialidades
                </h3>
                {editing ? (
                  <div>
                    <input
                      type="text"
                      value={form.specialties}
                      onChange={(e) =>
                        setForm({ ...form, specialties: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                      placeholder="Hipertrofia, Perda de peso, Reabilitação (separado por vírgula)"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Separe cada especialidade com vírgula
                    </p>
                  </div>
                ) : specialtiesList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {specialtiesList.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 italic">
                    Sem especialidades definidas
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact / Location */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Informações
              </h3>
              {editing ? (
                <div className="space-y-3">
                  {!isAthlete && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                        Localização
                      </label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) =>
                          setForm({ ...form, location: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                        placeholder="Lisboa, Portugal"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full mt-1 px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                      placeholder="+351 912 345 678"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {profile.location || (
                      <span className="text-gray-300 italic">Não definido</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Membro desde {memberSince}
                  </div>
                  {profile.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 text-xs">@</span>
                      {profile.email}
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 text-xs">📱</span>
                      {profile.phone}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Social Links — PT only */}
            {!isAthlete && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Redes Sociais
              </h3>
              {editing ? (
                <div className="space-y-3">
                  {[
                    {
                      key: "instagram" as const,
                      icon: Instagram,
                      placeholder: "@oseuinsta",
                    },
                    {
                      key: "facebook" as const,
                      icon: Facebook,
                      placeholder: "facebook.com/seuperfil",
                    },
                    {
                      key: "linkedin" as const,
                      icon: Linkedin,
                      placeholder: "linkedin.com/in/seuperfil",
                    },
                    {
                      key: "website" as const,
                      icon: Globe,
                      placeholder: "www.oseusite.pt",
                    },
                  ].map((social) => (
                    <div key={social.key} className="flex items-center gap-2">
                      <social.icon className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={form[social.key]}
                        onChange={(e) =>
                          setForm({ ...form, [social.key]: e.target.value })
                        }
                        className="flex-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none"
                        placeholder={social.placeholder}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.socialLinks?.instagram && (
                    <a
                      href={
                        profile.socialLinks.instagram.startsWith("http")
                          ? profile.socialLinks.instagram
                          : `https://instagram.com/${profile.socialLinks.instagram.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-500 transition"
                    >
                      <Instagram className="w-4 h-4" />
                      {profile.socialLinks.instagram}
                    </a>
                  )}
                  {profile.socialLinks?.facebook && (
                    <a
                      href={
                        profile.socialLinks.facebook.startsWith("http")
                          ? profile.socialLinks.facebook
                          : `https://${profile.socialLinks.facebook}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
                    >
                      <Facebook className="w-4 h-4" />
                      {profile.socialLinks.facebook}
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a
                      href={
                        profile.socialLinks.linkedin.startsWith("http")
                          ? profile.socialLinks.linkedin
                          : `https://${profile.socialLinks.linkedin}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 transition"
                    >
                      <Linkedin className="w-4 h-4" />
                      {profile.socialLinks.linkedin}
                    </a>
                  )}
                  {profile.socialLinks?.website && (
                    <a
                      href={
                        profile.socialLinks.website.startsWith("http")
                          ? profile.socialLinks.website
                          : `https://${profile.socialLinks.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition"
                    >
                      <Globe className="w-4 h-4" />
                      {profile.socialLinks.website}
                    </a>
                  )}
                  {!profile.socialLinks?.instagram &&
                    !profile.socialLinks?.facebook &&
                    !profile.socialLinks?.linkedin &&
                    !profile.socialLinks?.website && (
                      <p className="text-sm text-gray-300 italic">
                        Sem redes sociais adicionadas
                      </p>
                    )}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
