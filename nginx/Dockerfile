FROM nginx:alpine

# Устанавливаем certbot для автоматического получения SSL
RUN apk add --no-cache certbot certbot-nginx

# Копируем entrypoint скрипт
COPY entrypoint.sh /entrypoint.sh

# Устанавливаем права на выполнение и исправляем окончания строк (если нужно)
RUN chmod +x /entrypoint.sh && \
    sed -i 's/\r$//' /entrypoint.sh || true

ENTRYPOINT ["/entrypoint.sh"]

