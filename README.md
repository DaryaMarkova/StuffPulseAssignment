# StuffPulse

Дашборд оргструктуры: дерево узлов, аналитическая таблица, AI-поиск, realtime-обновления метрик по SSE.

## Стек

| Слой | Технологии |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, TanStack Query, Zod, Material Design Lite |
| Backend | Node.js, Express, TypeScript (`tsx`) |
| Данные | In-memory store + seed |

## Быстрый старт

Одной командой (установка зависимостей + API + UI):

```bash
npm run setup && npm start
```

| URL | |
| --- | --- |
| UI | http://localhost:5173 |
| API | http://localhost:3001 |

- `npm run setup` — зависимости корня и `server/`
- `npm start` — API + Vite вместе (concurrently)
- Vite проксирует `/api` → `http://localhost:3001`

### Docker

Конфиг — `.env` в корне.

```bash
docker compose up --build
```

| Сервис | URL |
| --- | --- |
| UI | http://localhost:8080 |
| API | http://localhost:3001 |

Nginx отдаёт статику с **gzip**, проксирует `/api` (включая SSE). Production-сборка UI — **≤ 200 КБ gzip**.

### Полезные скрипты

| Команда | Описание |
| --- | --- |
| `npm start` | клиент + сервер одной командой |
| `npm run setup` | установка зависимостей (корень + server) |
| `npm run dev` | только Vite |
| `npm run dev:server` | только API |
| `npm run build` | production-сборка UI |
| `npm run build:size` | сборка + проверка ≤200 КБ gzip |
| `npm test` | unit-тесты (Vitest) |
| `npm run lint` | Oxlint |
| `docker compose up --build` | клиент + сервер в Docker |

## CI / Deploy (GitHub Actions)

На push в `dev`:

1. **CI** (`.github/workflows/ci.yml`) — `lint`, `test`, `build:size`
2. **GitHub Pages** (`.github/workflows/deploy-pages.yml`) — сборка UI и публикация

Сайт: https://daryamarkova.github.io/StuffPulseAssignment/

На Pages UI читает **статичный** `public/data/nodes.json` (`VITE_USE_STATIC_DATA=true`), без API/SSE.  
Локально / в Docker: сначала `/api/org-tree`, при недоступности API — тот же JSON (offline fallback).

Обновить снимок seed:

```bash
npm run export:seed --prefix server
```

## AI в разработке

> Обязательный раздел: как использовался AI при создании проекта.

Проект собран в **Cursor** с AI-ассистентом. Оценка по объёму работы (условно): **~60% с поддержкой AI**, **~40% вручную**. AI — ускоритель реализации; архитектурные решения, приёмка и ответственность за результат — у разработчика.

### Сделано с помощью AI (~60%)

- scaffolding слоёв FSD и backend (controllers / services / types / store)
- boilerplate: React Query, Zod-схемы, Express-роутеры, синглтон-сервисы
- черновики UI-фич: keyboard navigation таблицы, flash ячеек, анимация раскрытия дерева, SSE-клиент, AI-поиск
- Docker / nginx-конфиг, unit-тесты агрегации, первичная генерация README и docs
- массовый рефакторинг под соглашения репозитория (алиасы `@/`, naming, структура файлов)

### Сделано вручную (~40%)

- выбор архитектуры: FSD на клиенте, layered Controllers → Services → Store на сервере
- продуктовые и UX-решения: скоуп таблицы по дереву, поведение realtime-патчей, состояния loading/error/empty
- правила проекта в `.cursor/rules` — чтобы AI работал в заданных рамках
- ревью каждого диффа, правки логики агрегации и граничных кейсов
- ручная проверка в браузере: SSE, фильтр, сортировка, a11y (`prefers-reduced-motion`), адаптив split-view
- финальная полировка API-контрактов, сообщений UI и git-истории (коммиты / merge)

### Контроль качества

- TypeScript + Zod на границе API — без «тихого» coerce
- AI не пушил и не мержил без явного запроса
- сомнительные куски переписывались или выкидывались после ревью
- `npm test` / `npm run build:size` — проверка критичных инвариантов

### Принцип

> Примерно 60/40: AI закрывает рутину и черновики реализации; человек задаёт рамки, принимает решения и отвечает за то, что попадает в репозиторий.

## Возможности

- **Дерево** — expand/collapse (2-й уровень открыт по умолчанию), выбор узла скоупит таблицу
- **Таблица** — сортировка, resize/reorder колонок, keyboard navigation (`↑`/`↓`, `Home`/`End`, `Enter`)
- **Фильтр** — AI-поиск (NL → структурированный фильтр на клиенте; fallback — поиск по имени)
- **Realtime** — SSE `/api/events`, патчи метрик в кэш React Query, подсветка изменённых ячеек
- **Анимация дерева** — height-transition; при `prefers-reduced-motion: reduce` без анимации
- **Состояния UI** — loading / error / empty; отмена `fetch` при размонтировании (`AbortSignal`)

## Архитектура

### Frontend — Feature-Sliced Design

```
src/
  app/        # провайдеры, глобальные стили
  pages/      # HomePage
  widgets/    # Tree, Table, SplitView, AppHeader
  features/   # dashboard (данные, фильтр, SSE)
  entities/   # node (схема, агрегация, UI-строки)
  shared/     # config, api, lib, ui
```

- Server state — **TanStack Query** (`staleTime` 5s)
- UI state — локальный `useState` / хуки виджетов
- Ответы API валидируются через **Zod**

### Backend — layered (не FSD)

```
server/src/
  controllers/   # HTTP: nodes, events
  services/      # aggregate, realtime
  store.ts       # in-memory
  data/          # seed
  types/
```

Поток: **Controller → Service → Store**.

### API

| Метод | Путь | Описание |
| --- | --- | --- |
| `GET` | `/api/health` | healthcheck |
| `GET` | `/api/org-tree` | список узлов |
| `GET` | `/api/org-tree/:id` | узел по id |
| `GET` | `/api/events` | SSE-поток патчей |

## Документация

| Файл | О чём |
| --- | --- |
| [docs/architecture.md](./docs/architecture.md) | слои приложения, поток данных API → UI |
| [docs/data-model.md](./docs/data-model.md) | дерево, агрегация, контракт realtime-патча (SSE) |

Offline / Pages snapshot: `public/data/nodes.json` (обновление: `npm run export:seed`).

## Структура репозитория

```
├── src/                 # frontend (FSD)
├── server/              # backend API
├── docs/                # архитектура и модель данных
├── docker/              # nginx для client-контейнера
├── Dockerfile           # сборка UI
├── docker-compose.yml
├── .env
├── .cursor/rules/       # соглашения для команды и AI
├── vite.config.ts
└── package.json
```

## Лицензия

Учебный / assignment-проект.
