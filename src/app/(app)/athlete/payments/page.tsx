"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface PaymentData {
  client: {
    plan: string | null;
    planStartDate: string | null;
    planEndDate: string | null;
    paymentStatus: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  paid: {
    label: "Ativo",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
  },
  pending: {
    label: "Pendente",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock className="w-6 h-6 text-amber-500" />,
  },
  overdue: {
    label: "Em Atraso",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
  },
};

export default function AthletePaymentsPage() {
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/athlete/payments")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((err) => console.error("Payments fetch error:", err))
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
      <div className="text-center py-20 text-gray-500">Erro ao carregar dados.</div>
    );
  }

  const { plan, planStartDate, planEndDate, paymentStatus } = data.client;
  const status = statusConfig[paymentStatus] || statusConfig.pending;
  const daysUntilEnd = planEndDate
    ? Math.ceil((new Date(planEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
        <p className="text-gray-500 mt-1">O teu plano atual com o Personal Trainer</p>
      </div>

      {/* Plan Card */}
      <div className={`rounded-2xl border-2 p-4 sm:p-6 ${status.bg}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {status.icon}
              <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
            </div>

            {plan ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{plan}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {planStartDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Início: {new Date(planStartDate).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                  {planEndDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Fim: {new Date(planEndDate).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sem plano ativo</h2>
                <p className="text-sm text-gray-500 mt-1">
                  O teu Personal Trainer ainda não atribuiu um plano. Entra em contacto para mais informações.
                </p>
              </div>
            )}
          </div>
          <CreditCard className="w-10 h-10 text-gray-300" />
        </div>

        {/* Expiry warnings */}
        {daysUntilEnd !== null && daysUntilEnd > 0 && daysUntilEnd <= 15 && (
          <div className="mt-4 bg-white/60 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>O teu plano expira em <strong>{daysUntilEnd} dias</strong>. Contacta o teu PT para renovar.</span>
          </div>
        )}
        {daysUntilEnd !== null && daysUntilEnd <= 0 && (
          <div className="mt-4 bg-white/60 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>O teu plano expirou! Contacta o teu PT para renovar.</span>
          </div>
        )}
      </div>

      {/* Future Stripe integration note */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pagamentos Online — Em Breve</h3>
            <p className="text-sm text-gray-500 mt-1">
              Estamos a trabalhar na integração de pagamentos online para que possas gerir as tuas subscrições diretamente por aqui. Até lá, os pagamentos são geridos pelo teu Personal Trainer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
