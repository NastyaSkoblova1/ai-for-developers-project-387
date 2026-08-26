# Календарь звонков (продолжение)

[![hexlet-check](https://github.com/NastyaSkoblova1/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/NastyaSkoblova1/ai-for-developers-project-387/actions)

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

## Стек

- **Backend:** Node.js + TypeScript + Fastify
- **Frontend:** Vue 3 + TypeScript + Vite + PrimeVue
- **E2E:** Playwright
- **API Spec:** TypeSpec + OpenAPI 3.1

## Установка

```bash
git clone https://github.com/NastyaSkoblova1/ai-for-developers-project-387.git
cd ai-for-developers-project-387
npm install
cd frontend && npm install && cd ..
```

Скопируй `.env.example` в `.env` и при необходимости измени:

```env
PORT=3000
HOST=0.0.0.0
FRONTEND_ORIGIN=http://localhost:5173
```

## Backend

Реализован на Node.js + TypeScript + Fastify. Использует in-memory хранилище: все данные хранятся внутри процесса и сбрасываются после перезапуска сервера.

### Структура

- `src/server.ts` — точка входа, запуск сервера
- `src/app.ts` — инициализация Fastify + CORS
- `src/routes/public.ts` — публичные endpoint'ы для гостей
- `src/routes/admin.ts` — административные endpoint'ы владельца
- `src/storage/memory-store.ts` — in-memory хранилище
- `src/storage/seed.ts` — seed-данные (owner, 3 event types)
- `src/services/` — бизнес-логика

### Команды

```bash
# Установка зависимостей
npm install

# Режим разработки (с hot-reload)
npm run dev

# Сборка
npm run build

# Запуск собранного приложения
npm start

# Проверка типов
npm run typecheck

# E2E тесты
npm run test:e2e
```

### API

- `GET /api/event-types` — список типов событий
- `GET /api/event-types/:id/slots` — свободные слоты на 14 дней
- `POST /api/bookings` — создать бронирование (возвращает 409 при конфликте)
- `GET /api/admin/owner` — профиль владельца
- `GET|POST /api/admin/event-types` — CRUD типов событий
- `GET /api/admin/bookings` — список всех бронирований

## Frontend

```bash
# Режим разработки
cd frontend && npm run dev

# Сборка
cd frontend && npm run build
```

## Docker

Собрать и запустить локально:

```bash
docker build -t meeting-app .
docker run --rm -e PORT=3000 -e HOST=0.0.0.0 -p 3000:3000 meeting-app
```

Приложение откроется на http://localhost:3000. Frontend и backend работают в одном контейнере.

## Production deployment

### Вариант 1: Render (Web Service, Docker runtime)

- **Конфигурация:** `render.yaml` в корне репозитория
- **Схема:** один Docker-контейнер, в котором Fastify раздаёт собранный frontend (`frontend/dist`) и API
- **Порт:** приложение использует переменную окружения `PORT`
- **Данные:** in-memory (хранятся в процессе и сбрасываются при перезапуске контейнера)

Для деплоя:
1. Запушьте изменения в `main`
2. В Render Dashboard: **New Web Service** → выберите репозиторий → **Runtime: Docker** → **Deploy**

### Вариант 2: Railway (альтернатива)

Используйте тот же `Dockerfile`. Создайте новый проект в Railway → **Deploy from GitHub repo** → выберите репозиторий. Railway автоматически определит `Dockerfile` и запустит контейнер.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
