# Архитектура StuffPulse

Кратко: слои приложения и путь данных от API до UI.

## Слои

### Backend (`server/`) — layered, не FSD

```
HTTP request
    ↓
controllers/     # NodesController, EventsController
    ↓
services/        # AggregatorService, RealtimeService
    ↓
store.ts         # in-memory NodeStore (+ seed в data/)
```

| Слой | Ответственность |
| --- | --- |
| **controllers** | HTTP/SSE, без бизнес-логики |
| **services** | агрегация, мутации листьев, broadcast |
| **store** | плоский список узлов, индекс детей, `applyLeafPatch` |
| **types / data** | контракты и начальный seed |

### Frontend (`src/`) — Feature-Sliced Design

```
app/         # QueryProvider, глобальные стили
pages/       # HomePage
widgets/     # Tree, Table, SplitView, AppHeader
features/    # dashboard: useDashboard, filter, EventsService
entities/    # node: схема Zod, nodesService, агрегация, TreeItem / NodeRow
shared/      # config, http, tree helpers, UI-примитивы
```

Зависимости направлены **вниз** по слоям FSD (pages → widgets/features → entities → shared).

## Поток данных: API → UI

### 1. Первичная загрузка

```
GET /api/org-tree
    → NodesController → store.getAll()
    → JSON { nodes: Node[] }
    → nodesService.getAll() + Zod (nodesResponseSchema)
    → useDashboard.queryFn
        → getAggregatedNodes(...)   # клиентский полный пересчёт
        → React Query cache ['nodes']
    → Dashboard
        → filter (по имени)
        → Tree / Table (buildTree, scope по selectedId)
```

- Кэш: **TanStack Query**, `staleTime` ≈ 5 секунд.
- Невалидный ответ Zod → ошибка (без silent coerce).

### 2. Realtime-обновления

В проекте realtime идёт по **SSE** (`GET /api/events`), не по WebSocket. Контракт тела патча тот же по смыслу — см. [data-model.md](./data-model.md).

```
RealtimeService.mutateRandomLeaf()
    → store.applyLeafPatch(leafId, deltas)
    → AggregatorService.recomputeAncestors(...)
    → broadcastPatch({ nodes: leaf + ancestors })
    → SSE event: patch
    → EventsService (EventSource)
        → patchEventSchema.safeParse
        → onPatch
    → useDashboard
        → collectFlashKeys (подсветка)
        → queryClient.setQueryData + applyPatch (merge by id)
    → Tree / Table ре-рендер с flash
```

На патче **полная** клиентская агрегация не гоняется: сервер уже присылает пересчитанные агрегаты листа и предков.

### 3. AI-поиск (клиент)

Строка поиска принимает естественный язык → `AiSearchService` строит `StructuredNodeFilter` и фильтрует узлы локально. Если метрик не распознано — **fallback** на текстовый поиск по `name` (`getFilterNodesByName`).

Примеры: `performance above 70`, `headcount >= 10`, `high performance`, `Engineering`.

### 4. UI state (рядом с фичей)

| Состояние | Где живёт |
| --- | --- |
| Список узлов | React Query `['nodes']` |
| Статус SSE | `useState` в `useDashboard` |
| Flash узлов/ячеек | `useState` в `useDashboard` |
| selectedId, filter | Dashboard / `useFilterNodes` |
| expand дерева | `useTreeExpansion` |
| sort / колонки таблицы | хуки виджета Table |

## Диаграмма (упрощённо)

```
┌──────────── server ────────────┐
│  store ← services ← controllers│
│           ↑ mutate + SSE       │
└────────────┬───────────────────┘
             │ REST + SSE
┌────────────▼───────────────────┐
│  entities/node (Zod, services) │
│  features/dashboard            │
│       ↓                        │
│  React Query cache             │
│       ↓                        │
│  widgets: Tree + Table         │
└────────────────────────────────┘
```

## Связанные документы

- [data-model.md](./data-model.md) — дерево, агрегация, контракт патча
