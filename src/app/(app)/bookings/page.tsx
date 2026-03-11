"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, Clock, User, Trash2, Check, X, ChevronLeft, ChevronRight, UserPlus, Repeat } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Client { id: string; name: string; email: string; phone: string; }
interface Booking { id: string; clientId: string; status: string; notes: string | null; client: Client; }
interface Slot {
  id: string; date: string; startTime: string; endTime: string;
  maxClients: number; isActive: boolean; notes: string | null; title: string;
  isRecurring: boolean;
  bookings: Booking[];
}

export default function BookingsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); return d.toISOString().split("T")[0];
  });
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d.toISOString().split("T")[0];
  });
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState({ date: "", startTime: "09:00", endTime: "10:00", maxClients: "1", notes: "", isRecurring: false, daysOfWeek: [] as number[], dateFrom: "", dateTo: "" });
  const [bookForm, setBookForm] = useState({ clientId: "", notes: "" });

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings`);
      if (!res.ok) throw new Error("Erro ao carregar slots");
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); setSlots([]); }
    setLoading(false);
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Erro ao carregar clientes");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchSlots(); fetchClients(); }, [fetchSlots, fetchClients]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const navigateWeek = (dir: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d.toISOString().split("T")[0]);
  };

  const slotsForDay = (day: string) => slots.filter(s => s.date.startsWith(day));

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = slotForm.isRecurring
      ? { startTime: slotForm.startTime, endTime: slotForm.endTime, maxClients: slotForm.maxClients, notes: slotForm.notes, isRecurring: true, daysOfWeek: slotForm.daysOfWeek, dateFrom: slotForm.dateFrom, dateTo: slotForm.dateTo }
      : { date: slotForm.date, startTime: slotForm.startTime, endTime: slotForm.endTime, maxClients: slotForm.maxClients, notes: slotForm.notes };
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowSlotModal(false);
      setSlotForm({ date: "", startTime: "09:00", endTime: "10:00", maxClients: "1", notes: "", isRecurring: false, daysOfWeek: [], dateFrom: "", dateTo: "" });
      fetchSlots();
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBookModal) return;
    const res = await fetch(`/api/bookings/${showBookModal}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookForm),
    });
    if (res.ok) {
      setShowBookModal(null);
      setBookForm({ clientId: "", notes: "" });
      fetchSlots();
    }
  };

  const [confirmDialog, setConfirmDialog] = useState<{action: () => void; title: string; message: string} | null>(null);

  const handleDeleteSlot = async (id: string) => {
    setConfirmDialog({
      title: "Eliminar slot",
      message: "Eliminar este slot?",
      action: async () => { await fetch(`/api/bookings/${id}`, { method: "DELETE" }); fetchSlots(); },
    });
  };

  const handleBookingStatus = async (bookingId: string, status: string) => {
    await fetch(`/api/bookings/booking/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchSlots();
  };

  const handleCancelBooking = async (bookingId: string) => {
    setConfirmDialog({
      title: "Cancelar marcação",
      message: "Cancelar esta marcação?",
      action: async () => { await fetch(`/api/bookings/booking/${bookingId}`, { method: "DELETE" }); fetchSlots(); },
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <PageHeader
        title="Agenda / Marcações"
        description="Gerir horários e marcações de clientes"
        action={
          <button onClick={() => { setSlotForm({ ...slotForm, date: selectedDate || today }); setShowSlotModal(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Slot
          </button>
        }
      />

      {/* Week navigation */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg" aria-label="Semana anterior">
            <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(weekDays[0]).toLocaleDateString("pt-PT", { day: "numeric", month: "long" })} — {new Date(weekDays[6]).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
          </h2>
          <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg" aria-label="Semana seguinte">
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const daySlots = slotsForDay(day);
            const isToday = day === today;
            const isSelected = day === selectedDate;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`p-1 sm:p-2 rounded-lg text-center transition-colors ${
                  isSelected ? "bg-emerald-50 ring-1 ring-emerald-500" :
                  isToday ? "bg-white dark:bg-gray-900" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">{dayNames[i]}</div>
                <div className={`text-sm font-semibold ${isToday ? "text-emerald-600" : "text-gray-900 dark:text-white"}`}>
                  {new Date(day).getDate()}
                </div>
                {daySlots.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {daySlots.slice(0, 3).map((_, j) => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ))}
                    {daySlots.length > 3 && <span className="text-[10px] text-gray-400">+{daySlots.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day view */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          <Calendar className="w-4 h-4 inline mr-1" />
          {new Date(selectedDate).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : slotsForDay(selectedDate).length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8" />}
            title="Sem slots"
            description="Não há horários configurados para este dia."
            action={
              <button onClick={() => { setSlotForm({ ...slotForm, date: selectedDate }); setShowSlotModal(true); }} className="btn-primary">
                <Plus className="w-4 h-4" /> Criar Slot
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {slotsForDay(selectedDate)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(slot => (
              <div key={slot.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">{slot.startTime} - {slot.endTime}</span>
                    </div>                    {slot.isRecurring && (
                      <span className="badge bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                        <Repeat className="w-3 h-3" /> Recorrente
                      </span>
                    )}                    <span className={`badge ${slot.isActive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {slot.isActive ? "Disponível" : "Indisponível"}
                    </span>
                    <span className="text-xs text-gray-400">
                      <User className="w-3 h-3 inline" /> {slot.bookings.length}/{slot.maxClients}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {slot.isActive && slot.bookings.length < slot.maxClients && (
                      <button onClick={() => setShowBookModal(slot.id)} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Agendar cliente" aria-label="Agendar cliente">
                        <UserPlus className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" aria-label="Eliminar slot">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                {slot.notes && <p className="text-xs text-gray-400 mb-2">{slot.notes}</p>}
                {slot.bookings.length > 0 && (
                  <div className="space-y-2">
                    {slot.bookings.map(b => (
                      <div key={b.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="min-w-0">
                          <span className="text-sm text-gray-900 dark:text-white font-medium truncate block">{b.client.name}</span>
                          {b.notes && <span className="text-xs text-gray-400">— {b.notes}</span>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`badge text-xs ${
                            b.status === "confirmed" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            b.status === "completed" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                            b.status === "cancelled" ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                            "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {b.status === "confirmed" ? "Confirmado" : b.status === "completed" ? "Concluído" : b.status === "cancelled" ? "Cancelado" : "Pendente"}
                          </span>
                          {b.status === "pending" && (
                            <button onClick={() => handleBookingStatus(b.id, "confirmed")} className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded" title="Confirmar" aria-label="Confirmar">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          )}
                          {b.status === "confirmed" && (
                            <button onClick={() => handleBookingStatus(b.id, "completed")} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Concluir" aria-label="Concluir">
                              <Check className="w-3.5 h-3.5 text-blue-600" />
                            </button>
                          )}
                          <button onClick={() => handleCancelBooking(b.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Cancelar" aria-label="Cancelar">
                            <X className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create slot modal */}
      <Modal isOpen={showSlotModal} onClose={() => setShowSlotModal(false)} title="Novo Slot de Horário">
        <form onSubmit={handleCreateSlot} className="space-y-4">
          {/* Recurring toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={slotForm.isRecurring}
              onChange={(e) => setSlotForm({ ...slotForm, isRecurring: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            />
            <Repeat className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Slot recorrente</span>
          </label>

          {slotForm.isRecurring ? (
            <>
              {/* Days of week */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dias da semana *</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { day: 1, label: "Seg" }, { day: 2, label: "Ter" }, { day: 3, label: "Qua" },
                    { day: 4, label: "Qui" }, { day: 5, label: "Sex" }, { day: 6, label: "Sáb" }, { day: 0, label: "Dom" },
                  ].map(({ day, label }) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const days = slotForm.daysOfWeek.includes(day)
                          ? slotForm.daysOfWeek.filter(d => d !== day)
                          : [...slotForm.daysOfWeek, day];
                        setSlotForm({ ...slotForm, daysOfWeek: days });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        slotForm.daysOfWeek.includes(day)
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">De *</label>
                  <input type="date" value={slotForm.dateFrom} onChange={(e) => setSlotForm({ ...slotForm, dateFrom: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Até *</label>
                  <input type="date" value={slotForm.dateTo} onChange={(e) => setSlotForm({ ...slotForm, dateTo: e.target.value })} className="input-field" required />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Data *</label>
              <input type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} className="input-field" required />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Hora Início *</label>
              <input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Hora Fim *</label>
              <input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Máx. Clientes</label>
            <input type="number" min="1" max="20" value={slotForm.maxClients} onChange={(e) => setSlotForm({ ...slotForm, maxClients: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Notas</label>
            <input type="text" value={slotForm.notes} onChange={(e) => setSlotForm({ ...slotForm, notes: e.target.value })} className="input-field" placeholder="Ex: Aula de grupo, PT privado..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowSlotModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{slotForm.isRecurring ? "Criar Recorrentes" : "Criar"}</button>
          </div>
        </form>
      </Modal>

      {/* Book client modal */}
      <Modal isOpen={!!showBookModal} onClose={() => setShowBookModal(null)} title="Agendar Cliente">
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Cliente *</label>
            <select value={bookForm.clientId} onChange={(e) => setBookForm({ ...bookForm, clientId: e.target.value })} className="input-field" required>
              <option value="">Selecionar</option>
              {clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Notas</label>
            <input type="text" value={bookForm.notes} onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })} className="input-field" placeholder="Notas opcionais..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowBookModal(null)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Agendar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.action()}
        title={confirmDialog?.title || ""}
        message={confirmDialog?.message || ""}
        confirmLabel="Confirmar"
        variant="danger"
      />
    </div>
  );
}
