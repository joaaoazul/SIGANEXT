"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, Gift, Calendar } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  info: Info,
  warning: AlertTriangle,
  success: Gift,
  reminder: Calendar,
};

const typeColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  reminder: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function AthleteNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PUT" });
    fetchNotifications();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notificações"
        description={`${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}`}
        action={
          unreadCount > 0 ? (
            <button onClick={markAllRead} className="btn-secondary">
              <CheckCheck className="w-4 h-4" /> Marcar todas como lidas
            </button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="Sem notificações"
          description="As tuas notificações aparecerão aqui."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            const colorClass = typeColors[n.type] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
            return (
              <div
                key={n.id}
                className={`card flex items-start gap-3 cursor-pointer transition hover:shadow-sm ${!n.isRead ? "border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10" : ""}`}
                onClick={() => !n.isRead && markAsRead(n.id)}
                role="button"
                tabIndex={0}
                aria-label={`Notificação: ${n.title}${!n.isRead ? " (não lida)" : ""}`}
                onKeyDown={(e) => { if (e.key === "Enter" && !n.isRead) markAsRead(n.id); }}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-medium ${!n.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{n.title}</h3>
                    {n.isGlobal && <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-full">Geral</span>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString("pt-PT")}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-2" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
