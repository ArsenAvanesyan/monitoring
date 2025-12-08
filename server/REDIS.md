# 🚀 Мониторинг сервер

## Быстрый старт

### Локальная разработка

**macOS:**

```bash
brew install redis && brew services start redis
npm install
npm run dev
```

**Linux:**

```bash
sudo apt install redis-server && sudo systemctl start redis-server
npm install
npm run dev
```

**Windows (WSL):**

```bash
wsl
sudo apt install redis-server && sudo service redis-server start
npm install
npm run dev
```

**Windows (Docker):**

```bash
docker run -d --name redis -p 6379:6379 redis:latest
npm install
npm run dev
```

### Production (деплой)

```bash
# 1. Установите Redis
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 2. Настройте безопасность (опционально)
sudo nano /etc/redis/redis.conf
# requirepass ваш_пароль
# bind 127.0.0.1

# 3. Добавьте в .env (если установлен пароль)
REDIS_PASSWORD=ваш_пароль

# 4. Запустите сервер
npm start

# ИЛИ через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## ⚙️ Настройка Redis

Переменные окружения в `.env` (опционально):

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## ✅ Проверка

```bash
# Проверка Redis
redis-cli ping  # Должно вернуть PONG

# Проверка сервера
curl http://localhost:3000
```

## 🔧 Решение проблем

**Redis не запускается:**

- macOS: `brew services restart redis`
- Linux: `sudo systemctl restart redis-server`

**Порт занят:**
Измените `REDIS_PORT` в `.env`

**Запуск без Redis (не рекомендуется):**

```bash
SKIP_REDIS_WAIT=true npm run dev
```
