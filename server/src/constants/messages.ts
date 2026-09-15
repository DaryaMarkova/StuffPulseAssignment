export const ERROR_MESSAGES = {
  NODE_NOT_FOUND: 'Node not found',
  nodeNotFoundWithId: (id: string) => `Node not found: ${id}`,
  onlyLeafPatch: (id: string) =>
    `Only leaf nodes can be patched directly: ${id}`,
  seedTooSmall: (count: number) =>
    `Seed must contain at least 40 nodes, got ${count}`,
} as const;

export const SSE = {
  EVENT_READY: 'ready',
  EVENT_PATCH: 'patch',
  HEARTBEAT: ': heartbeat\n\n',
  CONTENT_TYPE: 'text/event-stream',
  CACHE_CONTROL: 'no-cache',
  CONNECTION: 'keep-alive',
  readyMessage: () =>
    `event: ${SSE.EVENT_READY}\ndata: ${JSON.stringify({ ok: true })}\n\n`,
  patchMessage: (payload: unknown) =>
    `event: ${SSE.EVENT_PATCH}\ndata: ${JSON.stringify(payload)}\n\n`,
} as const;

export const LOG_MESSAGES = {
  apiListening: (port: number) =>
    `StuffPulse API listening on http://localhost:${port}`,
} as const;
