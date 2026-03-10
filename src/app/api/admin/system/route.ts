import { NextResponse } from "next/server";
import { getUser, isAdmin } from "@/lib/auth";
import os from "os";
import fs from "fs";
import { execSync } from "child_process";

// GET /api/admin/system — Server stats (admin only)
export async function GET() {
  try {
    const user = await getUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // CPU info
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown";
    const cpuCores = cpus.length;
    const loadAvg = os.loadavg();

    // Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Uptime
    const uptimeSeconds = os.uptime();

    // Disk usage
    let disk = { total: 0, used: 0, free: 0, percent: 0 };
    try {
      const dfOutput = execSync("df -B1 / | tail -1", { timeout: 5000 }).toString().trim();
      const parts = dfOutput.split(/\s+/);
      if (parts.length >= 4) {
        disk = {
          total: parseInt(parts[1]) || 0,
          used: parseInt(parts[2]) || 0,
          free: parseInt(parts[3]) || 0,
          percent: parseInt(parts[4]) || 0,
        };
      }
    } catch {}

    // Swap
    let swap = { total: 0, used: 0, free: 0 };
    try {
      const swapOutput = execSync("free -b | grep Swap", { timeout: 5000 }).toString().trim();
      const parts = swapOutput.split(/\s+/);
      swap = {
        total: parseInt(parts[1]) || 0,
        used: parseInt(parts[2]) || 0,
        free: parseInt(parts[3]) || 0,
      };
    } catch {}

    // PM2 processes
    let pm2Processes: { name: string; status: string; cpu: number; memory: number; uptime: number; restarts: number }[] = [];
    try {
      const pm2Output = execSync("pm2 jlist 2>/dev/null", { timeout: 5000 }).toString().trim();
      const pm2Data = JSON.parse(pm2Output);
      pm2Processes = pm2Data.map((p: any) => ({
        name: p.name,
        status: p.pm2_env?.status || "unknown",
        cpu: p.monit?.cpu || 0,
        memory: p.monit?.memory || 0,
        uptime: p.pm2_env?.pm_uptime || 0,
        restarts: p.pm2_env?.restart_time || 0,
      }));
    } catch {}

    // Node version
    const nodeVersion = process.version;

    // Hostname
    const hostname = os.hostname();
    const platform = `${os.type()} ${os.release()}`;

    // Network interfaces  
    const networkInterfaces = os.networkInterfaces();
    const ips: string[] = [];
    for (const iface of Object.values(networkInterfaces)) {
      if (!iface) continue;
      for (const config of iface) {
        if (!config.internal && config.family === "IPv4") {
          ips.push(config.address);
        }
      }
    }

    // Nginx status
    let nginxActive = false;
    try {
      execSync("systemctl is-active nginx", { timeout: 3000 });
      nginxActive = true;
    } catch {}

    // fail2ban status
    let fail2banActive = false;
    let fail2banBanned = 0;
    try {
      execSync("systemctl is-active fail2ban", { timeout: 3000 });
      fail2banActive = true;
      const f2bOutput = execSync("fail2ban-client status sshd 2>/dev/null | grep 'Currently banned'", { timeout: 3000 }).toString();
      const match = f2bOutput.match(/(\d+)/);
      fail2banBanned = match ? parseInt(match[1]) : 0;
    } catch {}

    // SSL certificate info (Cloudflare Origin Certificate)
    let ssl = { valid: false, domain: "", expiresAt: "", issuer: "", type: "" };
    try {
      // Check Cloudflare Origin Certificate first, then Let's Encrypt fallback
      const certPaths = [
        { path: "/etc/ssl/cloudflare/cert.pem", type: "Cloudflare Origin" },
        { path: "/etc/letsencrypt/live/siga180.pt/fullchain.pem", type: "Let's Encrypt" },
      ];
      for (const cert of certPaths) {
        if (fs.existsSync(cert.path)) {
          const certInfo = execSync(`openssl x509 -enddate -noout -in ${cert.path}`, { timeout: 3000 }).toString().trim();
          const dateStr = certInfo.replace("notAfter=", "");
          const issuerInfo = execSync(`openssl x509 -issuer -noout -in ${cert.path}`, { timeout: 3000 }).toString().trim();
          ssl = {
            valid: true,
            domain: "siga180.pt",
            expiresAt: new Date(dateStr).toISOString(),
            issuer: issuerInfo.replace("issuer=", "").trim(),
            type: cert.type,
          };
          break;
        }
      }
    } catch {}

    // Firewall
    let firewallActive = false;
    try {
      const ufwOutput = execSync("ufw status 2>/dev/null", { timeout: 3000 }).toString();
      firewallActive = ufwOutput.includes("active");
    } catch {}

    // Last deploy (git log)
    let lastDeploy = { hash: "", message: "", date: "", author: "" };
    try {
      const gitLog = execSync("cd /var/www/siga180 && git log -1 --format='%H|%s|%ci|%cn' 2>/dev/null", { timeout: 3000 }).toString().trim();
      const [hash, message, date, author] = gitLog.split("|");
      lastDeploy = { hash: hash?.slice(0, 7) || "", message: message || "", date: date || "", author: author || "" };
    } catch {}

    return NextResponse.json({
      server: {
        hostname,
        platform,
        ips,
        nodeVersion,
        uptimeSeconds,
      },
      cpu: {
        model: cpuModel,
        cores: cpuCores,
        loadAvg: loadAvg.map((l) => Math.round(l * 100) / 100),
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percent: Math.round((usedMem / totalMem) * 100),
      },
      swap,
      disk,
      pm2: pm2Processes,
      services: {
        nginx: nginxActive,
        fail2ban: fail2banActive,
        fail2banBanned,
        firewall: firewallActive,
        ssl,
      },
      lastDeploy,
    });
  } catch (error) {
    console.error("System stats error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
