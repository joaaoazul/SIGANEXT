"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user hasn't acknowledged yet
    const ack = localStorage.getItem("cookie-consent-ack");
    if (!ack) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent-ack", new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-black/30 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Cookie className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Este site utiliza apenas <strong>cookies estritamente necessários</strong> para
              autenticação e funcionamento da plataforma. Não utilizamos cookies de
              rastreamento, publicidade ou analítica.{" "}
              <Link
                href="/cookies"
                className="text-emerald-600 underline hover:text-emerald-700"
              >
                Política de Cookies
              </Link>{" "}
              ·{" "}
              <Link
                href="/privacy"
                className="text-emerald-600 underline hover:text-emerald-700"
              >
                Política de Privacidade
              </Link>
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition shadow-md shadow-emerald-500/20"
            >
              Entendido
            </button>
            <button
              onClick={handleAccept}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
