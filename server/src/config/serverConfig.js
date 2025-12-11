// ./config/serverConfig.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const corsConfig = {
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://mon.incfw.com',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
};

// прописываем мидлварки которые используем, чтобы сервер мог обрабатывать запросы от клиента
const serverConfig = (app) => {
  app.use(cors(corsConfig));
  app.use(express.static(path.join(__dirname, '../../', 'public')));
  app.use(express.urlencoded({ extended: true }));

  // JSON парсер с исключением для /api/access/data, /api и корневого пути / (там обрабатываем бинарные данные)
  app.use((req, res, next) => {
    // Пропускаем /api/access/data, /api и корневой путь / - там обрабатываем бинарные данные отдельно
    if (
      req.path &&
      (req.path === '/api/access/data' || req.path === '/api' || req.path === '/') &&
      req.method === 'POST'
    ) {
      return next();
    }
    // Для остальных маршрутов используем JSON парсер
    express.json({
      verify: (req, res, buf, encoding) => {
        // Логируем raw данные только для маршрутов /api/access (кроме /data)
        if (req.path && req.path.startsWith('/api/access') && buf && buf.length) {
          const rawData = buf.toString(encoding || 'utf8');
          console.log('='.repeat(50));
          console.log('Raw данные от access.exe (до парсинга JSON):');
          console.log(rawData);
          console.log('='.repeat(50));
        }
      },
    })(req, res, next);
  });

  app.use(cookieParser());
  app.use(morgan('dev'));
};

module.exports = serverConfig;
