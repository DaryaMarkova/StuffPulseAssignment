/**
 * Ошибка HTTP-запроса с кодом статуса.
 */
export class HttpError extends Error {
  readonly status: number;

  /**
   * Создаёт ошибку HTTP.
   *
   * @param {number} status - HTTP-статус ответа
   * @param {string} message - текст ошибки
   */
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * Проверяет, что ошибка — отмена `AbortController` / `fetch` signal.
 *
 * @param {unknown} error - пойманная ошибка
 * @returns {boolean} `true`, если запрос отменён
 */
export function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Выполняет fetch и возвращает JSON-тело ответа.
 * Передавайте `signal` из React Query `queryFn`, чтобы отменять запрос при размонтировании.
 *
 * @param {string} url - URL запроса
 * @param {RequestInit} [init] - опции `fetch` (включая `signal`)
 * @returns {Promise<unknown>} разобранное JSON-тело
 */
export async function fetchJson(
  url: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new HttpError(response.status, `Request failed: ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}
