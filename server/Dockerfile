FROM node:18-alpine

WORKDIR /app

# Устанавливаем wget для healthcheck
RUN apk add --no-cache wget

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости (включая sequelize-cli для миграций)
RUN npm ci --only=production && npm cache clean --force

# Копируем исходный код
COPY . .

# Устанавливаем права на выполнение и исправляем окончания строк (если нужно)
RUN chmod +x /app/scripts/docker-entrypoint.sh && \
    sed -i 's/\r$//' /app/scripts/docker-entrypoint.sh || true

# Создаем необходимые директории
RUN mkdir -p logs public/images public/uploads && \
    chown -R node:node /app

USER node

# Healthcheck endpoint будет на корневом пути
EXPOSE 3000

# Используем entrypoint скрипт для запуска миграций перед приложением
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
