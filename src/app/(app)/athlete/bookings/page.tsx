"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  Plus,
  X,
} from "lucide-react";

interface BookingSlotInfo {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string | null;
  price: number | null;
}

interface Booking {
  id: string;
  date: string;
  status: string;
  paymentStatus: string;
  notes: string | null;
  bookingSlot: BookingSlotInfo;
}

interface AvailableSlot {
  id: string;
  title: string;
  type: string;
  dayOfWeek: number | null;
  startTime: string;
  endTime: string;
  maxClients: number;
  price: number | null;
  location: string | null;
  isRecurring: boolean;
}

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  cancelled: "bg-red-50 text-red-600",
  completed: "bg-blue-50 text-blue-600",
};
const statusLabels: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendente",
  cancelled: "Cancelada",
  completed: "Concluída",
};

export default function AthleteBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/athlete/bookings?filter=${filter}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setBookings(data.bookings || []);
      setAvailableSlots(data.availableSlots || []);
    } catch (err) {
      console.error("Bookings fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const handleBook = async () => {
    if (!selectedSlot || !bookingDate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/athlete/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingSlotId: selectedSlot.id,
          date: bookingDate,
          notes: bookingNotes || null,
        }),
      });
      if (res.ok) {
        setShowBookModal(false);
        setSelectedSlot(null);
        setBookingDate("");
        setBookingNotes("");
        fetchBookings();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 mt-1">As tuas sessões e marcações</p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nova Marcação
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: "upcoming", label: "Próximas" },
          { key: "past", label: "Passadas" },
          { key: "all", label: "Todas" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs text-purple-400">
                  {dayNames[new Date(booking.date).getDay()].substring(0, 3)}
                </span>
                <span className="text-lg font-bold text-purple-600">
                  {new Date(booking.date).getDate()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{booking.bookingSlot.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {booking.bookingSlot.startTime} - {booking.bookingSlot.endTime}
                  </span>
                  {booking.bookingSlot.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {booking.bookingSlot.location}
                    </span>
                  )}
                  {booking.bookingSlot.price && (
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      {booking.bookingSlot.price}€
                    </span>
                  )}
                </div>
                {booking.notes && (
                  <p className="text-xs text-gray-400 mt-1 italic">{booking.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[booking.status] || "bg-gray-50 text-gray-600"}`}>
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            {filter === "upcoming" ? "Sem sessões marcadas" : "Sem sessões registadas"}
          </h3>
          <p className="text-gray-500 mt-2">
            {filter === "upcoming"
              ? "Marca uma sessão com o teu PT!"
              : "Nenhuma sessão encontrada para este filtro."}
          </p>
        </div>
      )}

      {/* New Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Nova Marcação</h2>
              <button
                onClick={() => setShowBookModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Slot selection */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Escolher sessão
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition ${
                        selectedSlot?.id === slot.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium text-gray-900 text-sm">{slot.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {slot.startTime} - {slot.endTime}
                        {slot.dayOfWeek !== null && ` • ${dayNames[slot.dayOfWeek]}`}
                        {slot.price && ` • ${slot.price}€`}
                        {slot.location && ` • ${slot.location}`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Data</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={2}
                  placeholder="Alguma observação..."
                />
              </div>

              <button
                onClick={handleBook}
                disabled={!selectedSlot || !bookingDate || submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-medium transition"
              >
                {submitting ? "A marcar..." : "Confirmar Marcação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
