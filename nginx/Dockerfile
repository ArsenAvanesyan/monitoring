FROM nginx:alpine

# Устанавливаем certbot для автоматического получения SSL
RUN apk add --no-cache certbot certbot-nginx

# Копируем entrypoint скрипт
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

