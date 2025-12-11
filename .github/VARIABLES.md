# GitHub Secrets Configuration

- `DOCKERHUB_USERNAME` - ваш username в DockerHub
- `DOCKERHUB_TOKEN` - токен доступа DockerHub

- `SSH_HOST` - IP адрес или домен сервера
- `SSH_USER` - пользователь для SSH
- `SSH_PORT` - порт SSH

- `SSH_PRIVATE_KEY` - приватный SSH ключ для подключения к серверу

- `DEPLOY_PATH` - путь к директории с docker-compose.yml

- `POSTGRES_USER` - пользователь PostgreSQL
- `POSTGRES_PASSWORD` - пароль PostgreSQL
- `POSTGRES_DB` - имя базы данных

- `SECRET_KEY` - ключ для reCAPTCHA
- `CLIENT_URL` - URL клиентского приложения
- `DOMAIN` - домен для SSL
- `EMAIL` - email для Let's Encrypt
- `ACCESS_TOKEN_SECRET` - секретный ключ для JWT access токенов
- `REFRESH_TOKEN_SECRET` - секретный ключ для JWT refresh токенов

## Как получить DockerHub Token

1. Зайдите на https://hub.docker.com/settings/security
2. Нажмите "New Access Token"
3. Выберите права: Read, Write, Delete
4. Скопируйте токен

## Как создать SSH ключ для сервера

**Важно:** SSH ключ для GitHub Actions НЕ должен иметь passphrase!

```bash
# На вашем локальном компьютере
# Создаём ключ БЕЗ passphrase (просто нажимайте Enter на вопрос о passphrase)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy -N ""

# Скопируйте публичный ключ на сервер (замените XXXX на ваши данные)
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub -p XXXX root@XX.XXX.XXX.XXX

# Проверьте подключение
ssh -p XXXX -i ~/.ssh/github_actions_deploy root@XX.XXX.XXX.XXX

# Добавьте приватный ключ в GitHub Secrets
cat ~/.ssh/github_actions_deploy
# Скопируйте весь вывод (включая -----BEGIN ... -----END ...)

```
