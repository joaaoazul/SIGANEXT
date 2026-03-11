"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Globe,
  Lock,
  Shield,
  Flame,
  RefreshCcw,
  Terminal,
  Clock,
  CheckCircle2,
  XCircle,
  Wifi,
} from "lucide-react";

interface SystemData {
  server: { hostname: string; platform: string; ips: string[]; nodeVersion: string; uptimeSeconds: number };
  cpu: { model: string; cores: number; loadAvg: number[] };
  memory: { total: number; used: number; free: number; percent: number };
  swap: { total: number; used: number; free: number };
  disk: { total: number; used: number; free: number; percent: number };
  pm2: { name: string; status: string; cpu: number; memory: number; uptime: number; restarts: number }[];
  services: { nginx: boolean; fail2ban: boolean; fail2banBanned: number; firewall: boolean; ssl: { valid: boolean; domain: string; expiresAt: string; issuer?: string; type?: string } };
  lastDeploy: { hash: string; message: string; date: string; author: string };
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function ProgressBar({ percent, label, detail }: { percent: number; label: string; detail: string }) {
  const color = percent > 90 ? "bg-red-500" : percent > 70 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-gray-600 dark:text-gray-300">{detail}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      <div className="text-right mt-0.5">
        <span className={`text-[10px] font-bold ${percent > 90 ? "text-red-400" : percent > 70 ? "text-yellow-400" : "text-emerald-400"}`}>{percent}%</span>
      </div>
    </div>
  );
}

export default function ServerPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/system");
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20"><p className="text-gray-500 dark:text-gray-400">Erro ao carregar dados do servidor.</p></div>;
  }

  const overallHealth =
    data.memory.percent < 85 &&
    data.disk.percent < 90 &&
    data.pm2.every((p) => p.status === "online") &&
    data.services.nginx &&
    data.services.firewall;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-500" />
            Infraestrutura
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Monitorização do servidor em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${overallHealth ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${overallHealth ? "bg-emerald-500" : "bg-red-500"}`} />
            {overallHealth ? "Operacional" : "Atenção"}
          </div>
          {lastUpdated && <span className="text-xs text-gray-600">{lastUpdated.toLocaleTimeString("pt-PT")}</span>}
          <button onClick={() => { setLoading(true); fetchData(); }} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: "Uptime", value: formatUptime(data.server.uptimeSeconds), color: "text-blue-400" },
          { icon: Cpu, label: "CPU Load", value: `${data.cpu.loadAvg[0]}`, color: data.cpu.loadAvg[0] > 2 ? "text-red-400" : "text-emerald-400" },
          { icon: Activity, label: "RAM", value: `${data.memory.percent}%`, color: data.memory.percent > 85 ? "text-red-400" : "text-emerald-400" },
          { icon: HardDrive, label: "Disco", value: `${data.disk.percent}%`, color: data.disk.percent > 90 ? "text-red-400" : "text-emerald-400" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Recursos
          </h2>
          <ProgressBar percent={data.memory.percent} label="Memória RAM" detail={`${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)}`} />
          <ProgressBar percent={data.disk.percent} label="Disco" detail={`${formatBytes(data.disk.used)} / ${formatBytes(data.disk.total)}`} />
          {data.swap.total > 0 && (
            <ProgressBar percent={Math.round((data.swap.used / data.swap.total) * 100)} label="Swap" detail={`${formatBytes(data.swap.used)} / ${formatBytes(data.swap.total)}`} />
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-blue-500" /> Servidor
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { label: "Hostname", value: data.server.hostname },
              { label: "SO", value: data.server.platform },
              { label: "Node.js", value: data.server.nodeVersion },
              { label: "IP", value: data.server.ips.join(", ") || "N/A" },
              { label: "CPU", value: `${data.cpu.model}` },
              { label: "Cores", value: `${data.cpu.cores}` },
              { label: "Load Avg", value: data.cpu.loadAvg.join(" / ") },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{r.label}</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium text-right max-w-[60%] truncate">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-blue-500" /> Serviços
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Globe, name: "Nginx", active: data.services.nginx, info: "Reverse Proxy" },
            { icon: Flame, name: "Fail2ban", active: data.services.fail2ban, info: `${data.services.fail2banBanned} IP(s) banidos` },
            { icon: Wifi, name: "Firewall", active: data.services.firewall, info: "UFW" },
            { icon: Lock, name: data.services.ssl.type ? `SSL (${data.services.ssl.type})` : "SSL/TLS", active: data.services.ssl.valid, info: data.services.ssl.valid ? `Expira: ${new Date(data.services.ssl.expiresAt).toLocaleDateString("pt-PT")}` : "Não configurado" },
          ].map((svc) => (
            <div key={svc.name} className={`rounded-xl border p-4 ${svc.active ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
              <div className="flex items-center gap-2 mb-2">
                <svc.icon className={`w-4 h-4 ${svc.active ? "text-emerald-400" : "text-red-400"}`} />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{svc.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {svc.active ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                <span className={`text-[10px] font-medium ${svc.active ? "text-emerald-400" : "text-red-400"}`}>{svc.active ? "Ativo" : "Inativo"}</span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{svc.info}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PM2 Processes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-purple-500" /> Processos PM2
        </h2>
        {data.pm2.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">Sem dados PM2 (apenas disponível no servidor)</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Nome</th>
                  <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Estado</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">CPU</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Memória</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Uptime</th>
                  <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Restarts</th>
                </tr>
              </thead>
              <tbody>
                {data.pm2.map((proc, i) => (
                  <tr key={i} className="border-b border-gray-200/50 dark:border-gray-800/50">
                    <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{proc.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${proc.status === "online" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${proc.status === "online" ? "bg-emerald-500" : "bg-red-500"}`} />
                        {proc.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-500 dark:text-gray-400">{proc.cpu}%</td>
                    <td className="py-2.5 px-3 text-right text-gray-500 dark:text-gray-400">{formatBytes(proc.memory)}</td>
                    <td className="py-2.5 px-3 text-right text-gray-500 dark:text-gray-400">{proc.uptime ? formatUptime((Date.now() - proc.uptime) / 1000) : "—"}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={proc.restarts > 5 ? "text-orange-400 font-medium" : "text-gray-500 dark:text-gray-400"}>{proc.restarts}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Last Deploy */}
      {data.lastDeploy.hash && (
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-4">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Último Deploy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div><span className="text-gray-500 dark:text-gray-400">Commit</span><p className="font-mono text-gray-600 dark:text-gray-300 mt-0.5">{data.lastDeploy.hash}</p></div>
            <div><span className="text-gray-500 dark:text-gray-400">Mensagem</span><p className="text-gray-600 dark:text-gray-300 mt-0.5 truncate">{data.lastDeploy.message}</p></div>
            <div><span className="text-gray-500 dark:text-gray-400">Data</span><p className="text-gray-600 dark:text-gray-300 mt-0.5">{data.lastDeploy.date ? new Date(data.lastDeploy.date).toLocaleString("pt-PT") : "—"}</p></div>
            <div><span className="text-gray-500 dark:text-gray-400">Autor</span><p className="text-gray-600 dark:text-gray-300 mt-0.5">{data.lastDeploy.author}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
