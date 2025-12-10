#!/bin/sh
# Entrypoint для nginx - автоматическое получение SSL при первом запуске

set -e

DOMAIN="${DOMAIN:-mon.incoel.ru}"
EMAIL="${EMAIL:-admin@${DOMAIN}}"

# Определяем, локально ли мы (localhost, 127.0.0.1, или домен содержит localhost)
IS_LOCAL=false
if echo "$DOMAIN" | grep -qE "(localhost|127\.0\.0\.1|\.local)"; then
  IS_LOCAL=true
fi

echo "🔍 DOMAIN=${DOMAIN}, IS_LOCAL=${IS_LOCAL}"

# Проверяем наличие сертификата
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  # Если локально - пропускаем получение SSL, используем простой конфиг
  if [ "$IS_LOCAL" = "true" ]; then
    echo "🏠 Локальный режим - пропускаем получение SSL"
    # Удаляем все конфиги, чтобы избежать дубликатов
    rm -f /etc/nginx/conf.d/*.conf
    # Создаём простой конфиг без SSL
    cat > /etc/nginx/conf.d/default.conf <<EOF
upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:80;
}

server {
    listen 80;
    server_name localhost;

    # API запросы → Backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Изображения → Backend (статичные файлы)
    location /images {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # POST на корневой путь → Backend (для access.exe)
    location = / {
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_request_buffering off;
        proxy_buffering off;
        
        # POST → Backend
        if (\$request_method = POST) {
            proxy_pass http://backend;
            break;
        }
        # GET и HEAD → Frontend
        proxy_pass http://frontend;
    }

    # Все остальное → Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
    echo "✅ Запускаем nginx с простым конфигом (без SSL)..."
    exec nginx -g "daemon off;"
  fi
  
  # Если не локально - получаем SSL
  echo "🔒 SSL сертификат не найден, получаем автоматически..."

  # Создаём временный конфиг nginx только с HTTP (для получения сертификата)
  # Сначала удаляем старые временные файлы и очищаем директорию
  rm -f /etc/nginx/conf.d/default-temp.conf /etc/nginx/conf.d/default-original.conf
  # Удаляем все конфиги в директории, чтобы избежать дубликатов
  rm -f /etc/nginx/conf.d/*.conf
  
  cat > /etc/nginx/conf.d/default.conf <<EOF
upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:80;
}

server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # API запросы → Backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Изображения → Backend (статичные файлы)
    location /images {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # POST на корневой путь → Backend (для access.exe)
    location = / {
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_request_buffering off;
        proxy_buffering off;
        
        # POST → Backend
        if (\$request_method = POST) {
            proxy_pass http://backend;
            break;
        }
        # GET и HEAD → Frontend
        proxy_pass http://frontend;
    }

    # Все остальное → Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

  # Конфиг уже создан выше как default.conf

  # Запускаем nginx в фоне для получения сертификата
  echo "🚀 Запускаем nginx с временным конфигом..."
  nginx -g "daemon on;"

  # Ждём запуска nginx
  sleep 3

  # Получаем SSL сертификат (certbot установлен в образе)
  echo "📜 Получаем SSL сертификат от Let's Encrypt..."
  CERTBOT_OUTPUT=$(certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${EMAIL}" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d "${DOMAIN}" 2>&1)
  CERTBOT_EXIT=$?
  
  if [ $CERTBOT_EXIT -ne 0 ]; then
    echo "❌ Ошибка получения сертификата:"
    echo "$CERTBOT_OUTPUT"
    
    # Проверяем, не достигнут ли лимит rate limit
    if echo "$CERTBOT_OUTPUT" | grep -q "too many failed authorizations"; then
      echo "⚠️ Достигнут лимит Let's Encrypt. Подождите час и попробуйте снова."
      echo "🔄 Продолжаем работу с HTTP только (без SSL)..."
      # Оставляем временный HTTP конфиг и продолжаем работу
      exec nginx -g "daemon off;"
    fi
    
    # Для других ошибок - выходим
    if [ -f "/etc/nginx/conf.d/default-original.conf" ]; then
      mv /etc/nginx/conf.d/default-original.conf /etc/nginx/conf.d/default.conf
    fi
    nginx -s quit
    exit 1
  fi

  echo "✅ Сертификат получен! Возвращаем полный конфиг..."

  # Возвращаем оригинальный конфиг с SSL
  if [ -f "/etc/nginx/conf.d/default-original.conf" ]; then
    mv /etc/nginx/conf.d/default-original.conf /etc/nginx/conf.d/default.conf
  fi

  # Останавливаем nginx
  nginx -s quit
  sleep 2
fi

# Если сертификат есть, но SSL конфиг не создан - создаём его
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ] && ! grep -q "listen 443" /etc/nginx/conf.d/default.conf 2>/dev/null; then
  echo "🔒 Сертификат найден, создаём SSL конфиг..."
  rm -f /etc/nginx/conf.d/*.conf
  
  cat > /etc/nginx/conf.d/default.conf <<EOF
upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:80;
}

# HTTP → HTTPS редирект
server {
    listen 80;
    server_name ${DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # API запросы → Backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Изображения → Backend (статичные файлы)
    location /images {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # POST на корневой путь → Backend (для access.exe)
    location = / {
        if (\$request_method = POST) {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_request_buffering off;
            proxy_buffering off;
            break;
        }
        # GET и HEAD → Frontend
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Все остальное → Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
  echo "✅ SSL конфиг создан!"
fi

echo "✅ Запускаем nginx с полным конфигом..."
exec nginx -g "daemon off;"

