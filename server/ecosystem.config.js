module.exports = {
  apps: [{
    name: 'app',
    script: './src/app.js',
    cwd: '/var/www/www-root/data/www/mon.incoel.ru/server',
    instances: 1,
    exec_mode: 'fork', // Используем fork вместо cluster
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};

