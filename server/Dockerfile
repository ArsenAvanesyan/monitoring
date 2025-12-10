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

# Копируем entrypoint скрипт
COPY scripts/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Создаем необходимые директории
RUN mkdir -p logs public/images public/uploads && \
    chown -R node:node /app

USER node

# Healthcheck endpoint будет на корневом пути
EXPOSE 3000

# Используем entrypoint скрипт для запуска миграций перед приложением
ENTRYPOINT ["/app/docker-entrypoint.sh"]
