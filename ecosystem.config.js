module.exports = {
  apps: [
    {
      name: "siga180",
      script: ".next/standalone/server.js",
      cwd: "/var/www/siga180",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      instances: "max", // Scale to all available CPUs
      exec_mode: "cluster",
      max_memory_restart: "768M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/siga180/error.log",
      out_file: "/var/log/siga180/out.log",
      merge_logs: true,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
    {
      // RGPD data retention cleanup — runs every Sunday at 3:00 AM
      name: "siga180-data-retention",
      script: "npx",
      args: "tsx scripts/data-retention-cleanup.ts",
      cwd: "/var/www/siga180",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 3 * * 0", // Every Sunday at 3 AM
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/siga180/data-retention-error.log",
      out_file: "/var/log/siga180/data-retention-out.log",
    },
  ],
};
