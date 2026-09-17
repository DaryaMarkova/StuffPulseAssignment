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
 * Выполняет fetch и возвращает JSON-тело ответа.
 *
 * @param {string} url - URL запроса
 * @param {RequestInit} [init] - опции `fetch`
 * @returns {Promise<unknown>} разобранное JSON-тело
 */
export async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new HttpError(response.status, `Request failed: ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}
