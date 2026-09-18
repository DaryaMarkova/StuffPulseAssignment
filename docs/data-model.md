# Модель данных

Дерево узлов, алгоритмы агрегации и контракт realtime-патча.

> Realtime в проекте реализован через **SSE** (`GET /api/events`), не WebSocket. Ниже — фактический контракт события `patch` (тело JSON совпало бы и с WS-сообщением того же формата).

## Узел (`Node`)

Плоский список; иерархия задаётся `parentId`.

| Поле | Тип | Смысл |
| --- | --- | --- |
| `id` | `string` | уникальный id |
| `name` | `string` | отображаемое имя |
| `parentId` | `string \| null` | родитель; `null` — корень |
| `ownHeadcount` | `number` | **собственный** headcount (без потомков) |
| `ownBudget` | `number` | собственный budget |
| `ownPerformance` | `number` | собственный performance `0…100` |
| `headcount` | `number` | **агрегат**: own + потомки |
| `budget` | `number` | агрегат: own + потомки |
| `performance` | `number` | агрегат: взвешенное среднее по headcount |
| `updatedAt` | ISO datetime | время последнего пересчёта / патча |

Клиент валидирует через Zod (`nodeSchema`).

### Ответ списка

```ts
type NodesResponse = {
  nodes: Node[];
};
```

`GET /api/org-tree` → `{ "nodes": [ ... ] }`.

## Дерево на клиенте

API отдаёт **плоский** массив. UI строит лес через `buildTree`:

1. Создать `TreeNode` для каждого id (`children: []`, `depth: 0`).
2. Если `parentId === null` (или родитель не найден) — узел в `roots`.
3. Иначе — push в `parent.children`.
4. Рекурсивно проставить `depth`.

Дальше:

- **Tree** — expand/collapse (`expandedIds`), по умолчанию открыт 2-й уровень.
- **Table** — `flattenVisible` / scope по `collectSubtreeIds(selectedId)`.
- Фильтр по имени режет плоский список до построения/отображения (см. dashboard).

```
Company (root, depth 0)
├── Engineering (depth 1)
│   ├── Frontend (depth 2)   ← лист
│   └── Backend  (depth 2)
└── Sales (depth 1)
```

Лист = узел без детей в индексе `parentId → children[]`. Мутации realtime применяются **только к листьям**.

## Алгоритм агрегации

Одинаковая семантика на сервере и клиенте.

### Формулы

Для узла `N` с детьми `C₁…Cₖ` (у детей уже посчитаны агрегаты):

```
headcount(N)    = ownHeadcount(N) + Σ headcount(Cᵢ)
budget(N)       = ownBudget(N)    + Σ budget(Cᵢ)

weighted        = ownPerformance(N) * ownHeadcount(N)
                + Σ performance(Cᵢ) * headcount(Cᵢ)

performance(N)  = headcount(N) > 0
                    ? clamp(round(weighted / headcount(N)), 0, 100)
                    : ownPerformance(N)
```

Лист: агрегаты = own-поля.

### Сервер: инкрементальный путь (`recomputeAncestors`)

После патча листа:

1. Обновить own-метрики листа в store.
2. Идя **вверх** по `parentId`: пересчитать текущий узел из детей, записать в `byId`, добавить в `patched[]`.
3. Вернуть массив **лист + предки** (снизу вверх) — его и шлют в патче.

Сложность O(высота дерева × число детей на уровне), без полного обхода всего леса.

### Клиент: полный пересчёт при загрузке (`getAggregatedNodes`)

1. Индекс `byId` и `children` по `parentId`.
2. DFS/мемоизация `aggregateSubtree(id)` снизу вверх.
3. Пройти корни (`parentId === null`), затем «осиротевшие» узлы.
4. Вернуть новый массив узлов с обновлёнными `headcount` / `budget` / `performance`.

После SSE-патча клиент **только мержит** пришедшие узлы по `id` (`applyPatch`) — повторный полный `getAggregatedNodes` не вызывается.

## Контракт realtime-патча (SSE)

### Транспорт

| | |
| --- | --- |
| Endpoint | `GET /api/events` |
| Протокол | **Server-Sent Events** |
| Клиент | `EventSource` + ручной reconnect (exponential backoff) |

События:

| `event` | `data` | Назначение |
| --- | --- | --- |
| `ready` | `{ "ok": true }` | поток установлен |
| `patch` | `PatchEvent` (JSON) | изменившиеся узлы |
| комментарий / heartbeat | `:heartbeat` |keep-alive ~15s |

Кадр патча на проводе:

```http
event: patch
data: {"nodes":[...]}

```

### Тело патча

```ts
type PatchEvent = {
  /** Минимум 1 узел: изменённый лист и все пересчитанные предки. */
  nodes: Node[];
};
```

Zod на клиенте: `patchEventSchema` — `nodes` непустой массив полных `Node` (не delta-only полей).

Пример (схематично):

```json
{
  "nodes": [
    {
      "id": "frontend",
      "name": "Frontend",
      "parentId": "engineering",
      "ownHeadcount": 12,
      "ownBudget": 500000,
      "ownPerformance": 78,
      "headcount": 12,
      "budget": 500000,
      "performance": 78,
      "updatedAt": "2026-09-17T18:00:00.000Z"
    },
    {
      "id": "engineering",
      "name": "Engineering",
      "parentId": "company",
      "ownHeadcount": 5,
      "ownBudget": 100000,
      "ownPerformance": 70,
      "headcount": 40,
      "budget": 1200000,
      "performance": 74,
      "updatedAt": "2026-09-17T18:00:00.000Z"
    }
  ]
}
```

### Семантика на клиенте

1. Распарсить JSON → Zod.
2. Сравнить с кэшем → ключи flash (`nodeId`, `nodeId:columnId`).
3. `setQueryData`: заменить узлы с теми же `id`, остальные без изменений.
4. UI подсвечивает изменённые строки/ячейки на короткое время.

### Почему не «сырой» WebSocket

Для одностороннего потока сервер → клиент достаточно SSE: проще прокси/reconnect, нативный `EventSource`. Контракт **payload** (`PatchEvent`) можно перенести на WebSocket без смены модели данных — сменится только framing.

## Связанные документы

- [architecture.md](./architecture.md) — слои и поток API → UI
