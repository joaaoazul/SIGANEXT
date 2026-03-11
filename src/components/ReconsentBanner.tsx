"use client";

import { useState, useEffect } from "react";
import { CURRENT_POLICY_VERSION } from "@/lib/constants";

export default function ReconsentBanner() {
  const [show, setShow] = useState(false);
  const [userVersion, setUserVersion] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.consentVersion && data.consentVersion !== CURRENT_POLICY_VERSION) {
          setUserVersion(data.consentVersion);
          setShow(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await fetch("/api/auth/reconsent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: CURRENT_POLICY_VERSION }),
      });
      setShow(false);
    } catch {
      // silently fail
    }
    setAccepting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50 dark:bg-amber-950/80 border-t-2 border-amber-400 dark:border-amber-600 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Política de Privacidade Atualizada
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            A nossa Política de Privacidade foi atualizada (versão {CURRENT_POLICY_VERSION}).
            A sua versão anterior era {userVersion}. Por favor reveja e aceite para continuar a usar a plataforma.{" "}
            <a href="/privacy" target="_blank" className="underline hover:text-amber-900">
              Ver Política de Privacidade
            </a>
          </p>
        </div>
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
        >
          {accepting ? "A aceitar..." : "Aceito a nova política"}
        </button>
      </div>
    </div>
  );
}
