// server/src/services/websocketService.js
// Сервис для управления WebSocket подключениями (совместим с HTTP/2)

class WebSocketService {
  constructor() {
    this.io = null;
    this.clients = new Map(); // Map для хранения информации о клиентах
  }

  // Инициализация Socket.io
  initialize(server) {
    const { Server } = require('socket.io');

    // Настройка CORS для Socket.io
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.CLIENT_URL,
      'https://mon.incfw.com',
    ].filter(Boolean);

    this.io = new Server(server, {
      cors: {
        origin: function (origin, callback) {
          // Разрешаем запросы без origin (например, от мобильных приложений)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            // Для разработки разрешаем все
            callback(null, true);
          }
        },
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'], // Поддержка разных транспортов
    });

    // Обработка подключений
    this.io.on('connection', (socket) => {
      console.log('✅ WebSocket клиент подключен:', socket.id);
      this.clients.set(socket.id, {
        socket,
        connectedAt: new Date(),
      });

      // Отправляем подтверждение подключения
      socket.emit('connected', {
        message: 'Подключено к WebSocket',
        socketId: socket.id,
      });

      // Обработка отключения
      socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket клиент отключен:', socket.id, 'Причина:', reason);
        this.clients.delete(socket.id);
      });

      // Обработка ошибок
      socket.on('error', (error) => {
        console.error('❌ Ошибка WebSocket клиента:', socket.id, error);
      });
    });

    console.log('✅ WebSocket сервер инициализирован');
    return this.io;
  }

  // Отправить событие всем подключенным клиентам
  broadcast(event, data) {
    if (!this.io) {
      console.warn('⚠️ WebSocket сервер не инициализирован');
      return;
    }

    this.io.emit(event, data);
    console.log(`📡 WebSocket событие "${event}" отправлено ${this.clients.size} клиентам`);
  }

  // Отправить событие конкретному клиенту
  emitToClient(socketId, event, data) {
    if (!this.io) {
      console.warn('⚠️ WebSocket сервер не инициализирован');
      return;
    }

    const client = this.clients.get(socketId);
    if (client) {
      client.socket.emit(event, data);
      console.log(`📡 WebSocket событие "${event}" отправлено клиенту ${socketId}`);
    } else {
      console.warn(`⚠️ Клиент ${socketId} не найден`);
    }
  }

  // Получить количество подключенных клиентов
  getClientCount() {
    return this.clients.size;
  }

  // Получить экземпляр io
  getIO() {
    return this.io;
  }
}

// Экспортируем singleton экземпляр
module.exports = new WebSocketService();
