# Meetflow Frontend

Frontend-приложение для сервиса бронирования встреч, построенное на Vue 3 + TypeScript + Vite + PrimeVue.

## Технологический стек

- **Vue 3** — фреймворк
- **TypeScript** — типизация
- **Vite** — сборка
- **Vue Router** — маршрутизация
- **TanStack Vue Query** — server state management
- **PrimeVue 4** — UI компоненты (Aura preset)
- **Zod** — валидация форм
- **date-fns** — работа с датами
- **@hey-api/openapi-ts** — генерация API-клиента

## Структура проекта

```
frontend/
├── src/
│   ├── api/                    # API-обёртки поверх generated client
│   ├── assets/theme/            # Кастомная тема PrimeVue
│   ├── components/
│   │   ├── public/              # Публичные компоненты
│   │   └── admin/               # Административные компоненты
│   ├── composables/             # Vue Query hooks
│   ├── generated/               # Auto-generated API client (не редактировать)
│   ├── layouts/
│   │   ├── PublicLayout.vue     # Публичный layout
│   │   └── AdminLayout.vue      # Admin layout с sidebar
│   ├── utils/
│   │   ├── dates.ts             # Утилиты дат
│   │   └── errors.ts            # Обработка ошибок
│   ├── views/
│   │   ├── HomeView.vue         # Главная: список event types
│   │   ├── BookingView.vue      # Бронирование: календарь + слоты + форма
│   │   ├── AdminDashboardView.vue
│   │   ├── AdminEventTypesView.vue
│   │   ├── AdminEventTypeFormView.vue
│   │   └── AdminBookingsView.vue
│   ├── App.vue
│   └── main.ts                  # Точка входа
├── .env                         # Переменные окружения
├── .env.example
├── openapi-ts.config.ts         # Конфиг генерации API
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Установка и запуск

```bash
cd frontend
npm install
```

### Переменные окружения

Создайте `.env` (или скопируйте `.env.example`):

```
VITE_API_BASE_URL=http://localhost:3000
```

### Запуск dev-сервера

```bash
npm run dev
```

### Production сборка

```bash
npm run build
```

### Генерация API-клиента

```bash
npm run generate:api
```

Генератор читает `../tsp-output/schema/openapi.yaml` и создаёт типы и сервисы в `src/generated/`.

## Экраны приложения

### Публичная часть

| Маршрут | Описание |
|---------|----------|
| `/` | Список доступных типов встреч |
| `/book/:eventTypeId` | Выбор даты, времени и создание бронирования |

### Административная часть

| Маршрут | Описание |
|---------|----------|
| `/admin` | Dashboard: статистика, ближайшие встречи |
| `/admin/event-types` | Список типов встреч |
| `/admin/event-types/new` | Создание типа встречи |
| `/admin/event-types/:id/edit` | Редактирование типа встречи |
| `/admin/bookings` | Список всех бронирований |

## Использованные API-эндпоинты

| Endpoint | Method | UI-экран |
|----------|--------|----------|
| `GET /event-types` | Публичный | HomeView |
| `GET /event-types/:id/slots` | Публичный | BookingView |
| `POST /bookings` | Публичный | BookingView |
| `GET /admin/owner` | Админ | Dashboard, PublicLayout |
| `GET /admin/event-types` | Админ | EventTypesView, Dashboard |
| `POST /admin/event-types` | Админ | EventTypeFormView |
| `GET /admin/event-types/:id` | Админ | EventTypeFormView |
| `PATCH /admin/event-types/:id` | Админ | EventTypeFormView |
| `DELETE /admin/event-types/:id` | Админ | EventTypesView |
| `GET /admin/bookings` | Админ | BookingsView, Dashboard |

## Известные ограничения API

- **Нет авторизации** — admin-интерфейс открыт без login/logout
- **Нет `GET /bookings/:id`** — confirmation screen не восстанавливается после refresh (показывается inline после POST)
- **Нет отмены/переноса бронирований** — соответствующих кнопок нет
- **Нет Availability API** — настройка доступности скрыта из навигации
- **Нет `isActive` у EventType** — нельзя включить/выключить тип, только CRUD
- **Slots возвращаются на 14 дней сразу** — фильтрация по дате на клиенте
- **Нет `status` у Booking** — все бронирования отображаются как «Подтверждено»

## Чек-лист ручного тестирования

### Публичный flow

1. [ ] Открыть `/` — виден список event types с названием, описанием и длительностью
2. [ ] Кликнуть на event type — переход на `/book/:id`
3. [ ] На странице бронирования:
   - [ ] Видна информация о типе встречи
   - [ ] Доступен выбор даты (HTML date input)
   - [ ] При выборе даты показываются слоты на эту дату
   - [ ] Прошедшие даты не показываются как доступные
   - [ ] Даты без слотов показывают empty state
4. [ ] Выбрать время — появляется форма гостя
5. [ ] Попытка отправить форму без заполнения — показываются ошибки Zod
6. [ ] Заполнить имя, email (опционально телефон) и отправить
7. [ ] Во время отправки кнопка disabled, показывается spinner
8. [ ] После успеха — inline confirmation panel с деталями бронирования
9. [ ] Кнопка «Забронировать ещё» сбрасывает форму

### Админ-панель

1. [ ] Открыть `/admin` — dashboard с owner info, статистикой, ближайшими бронированиями
2. [ ] Перейти в «Типы встреч»:
   - [ ] Список с названием, длительностью, описанием
   - [ ] Кнопка «Копировать ссылку» — копирует публичный URL
   - [ ] Кнопка «Редактировать» — переход на форму
   - [ ] Кнопка «Удалить» — confirmation dialog перед удалением
3. [ ] Создание типа встречи:
   - [ ] Заполнить название, описание, длительность
   - [ ] Ошибки валидации Zod показываются inline
   - [ ] После создания — редирект на список
4. [ ] Редактирование типа встречи:
   - [ ] Форма загружается с текущими данными
   - [ ] PATCH с merge-patch+json
   - [ ] После сохранения — редирект на список
5. [ ] Удаление:
   - [ ] Confirm dialog
   - [ ] После удаления — список обновляется (invalidateQueries)
6. [ ] Перейти в «Бронирования»:
   - [ ] Таблица со всеми бронированиями
   - [ ] Отображается гость, email, тип встречи, дата/время
   - [ ] Статус: «Предстоящее» или «Прошедшее»
   - [ ] Сортировка по дате (новые сверху)

### Общее

1. [ ] Responsive: sidebar на desktop, drawer/compact на mobile
2. [ ] Loading states: skeleton на всех списках
3. [ ] Error states: понятные сообщения при ошибках API
4. [ ] Empty states: понятные сообщения при отсутствии данных
5. [ ] Toast уведомления при успехе/ошибке операций
