# 🐳 Docker Setup

## Локально (предполагается, что докер уже стоит на своей тачке)

### Сборка и публикация образов в DockerHub

```bash
# 1. Собираем образы локально
docker compose build

# 2. Получаем ID образов
docker compose images -q backend
docker compose images -q frontend

# 3. Тегируем образы для DockerHub (заменить YOUR_USERNAME на свой)
docker tag $(docker compose images -q backend) YOUR_USERNAME/monitoring-backend:latest
docker tag $(docker compose images -q frontend) YOUR_USERNAME/monitoring-frontend:latest
docker tag $(docker compose images -q nginx) YOUR_USERNAME/monitoring-nginx:latest

# 4. Вход в DockerHub
docker login

# 5. Пушим образы в DockerHub
docker push YOUR_USERNAME/monitoring-backend:latest
docker push YOUR_USERNAME/monitoring-frontend:latest
docker push YOUR_USERNAME/monitoring-nginx:latest
```

### Тестирование локально

```bash
POSTGRES_USER='postgres' \
POSTGRES_PASSWORD='postgres' \
POSTGRES_DB='monitoring_docker' \
ACCESS_TOKEN_SECRET='dev_secret_1' \
REFRESH_TOKEN_SECRET='dev_secret_2' \
SECRET_KEY='dev_recaptcha_key' \
docker compose up -d
```

**Примечание:** `POSTGRES_USER` и `POSTGRES_DB` имеют значения по умолчанию (`postgres` и `monitoring_docker`), но, если отличаются или по какой-то причине нужны другие, можно указать явно.

## На сервере

### Первый запуск (один раз)

```bash
# 1. Устанавливаем Docker (если не установлен)
apt-get update
apt-get install docker.io docker-compose-plugin -y

# Проверяем установку
docker --version
docker compose version

# 2. Создаём директорию
mkdir -p /opt/monitoring-docker
cd /opt/monitoring-docker

# 3. Загружаем файлы (один раз)
# - docker-compose.yml  → /opt/monitoring-docker/docker-compose.yml
# - nginx/ (вся директория) → /opt/monitoring-docker/nginx/
mkdir -p /opt/monitoring-docker/nginx/conf.d

# 4. Входим в DockerHub
docker login

# 5. Запускаем с переменными окружения
# DOCKERHUB_USERNAME указывает, откуда пулить образы (backend, frontend, nginx)
# DOMAIN и EMAIL нужны для автоматического получения SSL (используем основной домен)
# Приложение будет доступно по https://mon.incoel.ru:8443 (не конфликтует с production на портах 80/443)
DOCKERHUB_USERNAME='your_username' \
POSTGRES_USER='postgres' \
POSTGRES_PASSWORD='secure_password' \
POSTGRES_DB='monitoring_docker' \
ACCESS_TOKEN_SECRET='jwt_secret_1' \
REFRESH_TOKEN_SECRET='jwt_secret_2' \
SECRET_KEY='recaptcha_key' \
CLIENT_URL='https://mon.incoel.ru:8443' \
DOMAIN='mon.incoel.ru' \
EMAIL='your-email@example.com' \
docker compose pull && \
docker compose up -d
```

#### Обновление приложения (только образы из DockerHub) - позднее спрячем в ci/cd

```bash
# 1. Переходим в директорию
cd /opt/monitoring-docker

# 2. Загружаем новые образы и перезапускаем
DOCKERHUB_USERNAME='your_username' \
POSTGRES_USER='postgres' \
POSTGRES_PASSWORD='secure_password' \
POSTGRES_DB='monitoring_docker' \
ACCESS_TOKEN_SECRET='jwt_secret_1' \
REFRESH_TOKEN_SECRET='jwt_secret_2' \
SECRET_KEY='recaptcha_key' \
CLIENT_URL='https://mon.incoel.ru:8443' \
docker compose pull && \
docker compose up -d
```

## 🌐 Доступ к приложению

Приложение доступно по адресу:

- **HTTPS:** `https://mon.incoel.ru:8443`

**Важно:** Используются порты 8080/8443, чтобы не конфликтовать с production версией на стандартных портах 80/443.

