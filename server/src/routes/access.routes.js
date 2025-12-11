// server/src/routes/access.routes.js

const {
    receiveData,
    getLastData,
    clearData,
    removeDuplicates,
} = require('../controllers/accessController');
const accessRouter = require('express').Router();
const express = require('express');
const verifyAccessExeToken = require('../middleware/verifyAccessExeToken');

// Middleware для логирования всех запросов к /api/access/*
accessRouter.use((req, res, next) => {
    console.log('\n' + '='.repeat(80));
    console.log(`🌐 ВХОДЯЩИЙ ЗАПРОС к /api/access${req.path}`);
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('IP:', req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress);
    console.log('User-Agent:', req.headers['user-agent'] || '(пусто)');
    console.log('Content-Type:', req.headers['content-type'] || '(не указан)');
    console.log('Content-Length:', req.headers['content-length'] || '(не указан)');
    if (req.method === 'POST' && req.headers['content-type']) {
        console.log('⚠️ POST запрос с Content-Type:', req.headers['content-type']);
    }
    console.log('='.repeat(80));
    next();
});

// Middleware для приема бинарных данных (до парсинга JSON)
// Поддерживаем как обычные данные, так и gzip архивы
accessRouter.post('/data', express.raw({ type: ['*/*', 'application/gzip'], limit: '50mb' }), (req, res, next) => {
    console.log('📥 POST /api/access/data');
    console.log('  Content-Type:', req.headers['content-type']);
    console.log('  X-Filename:', req.headers['x-filename'] || '(не указан)');
    console.log('  Content-Length:', req.headers['content-length'] || '(не указан)');

    // Сохраняем raw buffer для последующей обработки
    if (req.body && Buffer.isBuffer(req.body)) {
        req.rawBuffer = req.body;
        req.isGzip = req.headers['content-type'] === 'application/gzip';
        req.filename = req.headers['x-filename'] || null;
        console.log('  ✅ Raw buffer сохранен, размер:', req.rawBuffer.length, 'байт');
        console.log('  Это gzip архив:', req.isGzip ? 'ДА' : 'НЕТ');
    }
    next();
});

// POST endpoint для приема данных от access.exe (с проверкой токена)
// Проверка токена выполняется ПЕРЕД обработкой данных
accessRouter.post('/data', verifyAccessExeToken, receiveData);

// GET endpoint для получения последних данных от access.exe
accessRouter.get('/last', getLastData);

// POST endpoint для очистки данных
accessRouter.post('/clear', clearData);

// POST endpoint для удаления дубликатов устройств по IP
accessRouter.post('/remove-duplicates', removeDuplicates);

// GET endpoint (на случай если access.exe отправляет GET запросы) (без авторизации, пока)
accessRouter.get('/data', async (req, res) => {
    console.log('='.repeat(50));
    console.log('GET запрос от access.exe:');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
    console.log('Query параметры:', JSON.stringify(req.query, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', req.body);
    console.log('='.repeat(50));

    // Если данные в query параметрах
    let data = {};
    if (Object.keys(req.query).length > 0) {
        data = req.query;
    } else if (req.body && Object.keys(req.body).length > 0) {
        data = req.body;
    }

    // Пытаемся извлечь данные из URL, если они там есть
    // Например, если URL содержит JSON в параметре 'data'
    if (req.query.data) {
        try {
            data = JSON.parse(decodeURIComponent(req.query.data));
        } catch (e) {
            console.log('Не удалось распарсить данные из query параметра data');
        }
    }

    // Сохраняем данные, если они есть
    if (Object.keys(data).length > 0) {
        const { receiveData } = require('../controllers/accessController');
        // Вызываем логику сохранения данных
        req.body = data;
        await receiveData(req, res);
        return;
    }

    res.status(200).json({
        message: 'GET запрос получен, но данных не найдено',
        received: false,
        data: data,
        timestamp: new Date().toISOString(),
    });
});

module.exports = accessRouter;
