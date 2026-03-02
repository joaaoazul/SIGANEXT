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
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/siga180/error.log",
      out_file: "/var/log/siga180/out.log",
      merge_logs: true,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
