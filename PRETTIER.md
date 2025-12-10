# Prettier Configuration

Prettier настроен для автоматического форматирования кода в едином стиле.

## Установка

Установите зависимости:

```bash
# Для сервера
cd server
npm install

# Для клиента
cd client
npm install
```

## Использование

### Форматирование всех файлов

```bash
# Сервер
cd server
npm run format

# Клиент
cd client
npm run format
```

### Проверка форматирования (без изменений)

```bash
# Сервер
cd server
npm run format:check

# Клиент
cd client
npm run format:check
```

## Настройки

Текущая конфигурация Prettier (`.prettierrc`):

- **semi**: `true` - точки с запятой обязательны
- **singleQuote**: `true` - одинарные кавычки
- **tabWidth**: `2` - отступ 2 пробела
- **trailingComma**: `es5` - запятые в конце (где возможно)
- **printWidth**: `100` - максимальная длина строки 100 символов
- **arrowParens**: `always` - всегда скобки вокруг параметров стрелочных функций
- **bracketSpacing**: `true` - пробелы внутри фигурных скобок
- **endOfLine**: `lf` - Unix-стиль окончаний строк

## Интеграция с IDE

### VS Code

Добавьте в настройки (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### WebStorm / IntelliJ IDEA

1. Settings → Languages & Frameworks → JavaScript → Prettier
2. Включите "On code reformat" и "On save"
3. Укажите путь к Prettier: `node_modules/prettier`

## Игнорируемые файлы

Файлы, которые Prettier не будет форматировать, указаны в `.prettierignore`:
- `node_modules/`
- `dist/`, `build/`
- `.env` файлы
- Логи и временные файлы

