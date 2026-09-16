export const ERROR_MESSAGES = {
  NODE_NOT_FOUND: 'Node not found',

  /**
   * Формирует сообщение об отсутствии узла с указанием id.
   *
   * @param {string} id - идентификатор узла
   * @returns {string} текст ошибки
   */
  nodeNotFoundWithId: (id: string) => `Node not found: ${id}`,

  /**
   * Формирует сообщение о запрете патча нелистового узла.
   *
   * @param {string} id - идентификатор узла
   * @returns {string} текст ошибки
   */
  onlyLeafPatch: (id: string) =>
    `Only leaf nodes can be patched directly: ${id}`,

  /**
   * Формирует сообщение о слишком маленьком seed.
   *
   * @param {number} count - фактическое число узлов
   * @returns {string} текст ошибки
   */
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

  /**
   * Формирует SSE-сообщение `ready`.
   *
   * @returns {string} кадр SSE
   */
  readyMessage: () =>
    `event: ${SSE.EVENT_READY}\ndata: ${JSON.stringify({ ok: true })}\n\n`,

  /**
   * Формирует SSE-сообщение `patch`.
   *
   * @param {unknown} payload - тело события патча
   * @returns {string} кадр SSE
   */
  patchMessage: (payload: unknown) =>
    `event: ${SSE.EVENT_PATCH}\ndata: ${JSON.stringify(payload)}\n\n`,
} as const;

export const LOG_MESSAGES = {
  /**
   * Формирует сообщение о запуске API.
   *
   * @param {number} port - порт сервера
   * @returns {string} текст лога
   */
  apiListening: (port: number) =>
    `StuffPulse API listening on http://localhost:${port}`,
} as const;
