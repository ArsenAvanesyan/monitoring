module.exports = {
  apps: [
    {
      name: 'app',
      script: './src/app.js',
      cwd: '/var/www/www-root/data/www/mon.incfw.com/server',
      instances: 1,
      exec_mode: 'fork', // Используем fork вместо cluster
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Ждем Redis перед запуском
      wait_ready: false,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        WAIT_FOR_REDIS: 'true',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
