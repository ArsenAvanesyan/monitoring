// server/src/routes/access.routes.js

const { receiveData, getLastData, clearData } = require("../controllers/accessController");
const accessRouter = require("express").Router();
const express = require("express");

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
// Применяем только для POST запросов на /data
accessRouter.post("/data", express.raw({ type: '*/*', limit: '10mb' }), (req, res, next) => {
    // Сохраняем raw buffer для последующей обработки
    if (req.body && Buffer.isBuffer(req.body)) {
        req.rawBuffer = req.body;
        // Сохраняем raw текст для обработки NDJSON (newline-delimited JSON)
        // Не парсим здесь - это сделает контроллер, который знает про NDJSON формат
        // Просто сохраняем buffer для hex конвертации
    }
    next();
});

// POST endpoint для приема данных от access.exe (без авторизации, пока)
accessRouter.post("/data", receiveData);

// GET endpoint для получения последних данных от access.exe
accessRouter.get("/last", getLastData);

// POST endpoint для очистки данных
accessRouter.post("/clear", clearData);

// GET endpoint (на случай если access.exe отправляет GET запросы) (без авторизации, пока)
accessRouter.get("/data", async (req, res) => {
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
        const { receiveData } = require("../controllers/accessController");
        // Вызываем логику сохранения данных
        req.body = data;
        await receiveData(req, res);
        return;
    }
    
    res.status(200).json({ 
        message: 'GET запрос получен, но данных не найдено',
        received: false,
        data: data,
        timestamp: new Date().toISOString()
    });
});

module.exports = accessRouter;

