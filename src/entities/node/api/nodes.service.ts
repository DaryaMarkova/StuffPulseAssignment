import { fetchJson, isAbortError } from '@/shared/api';
import {
  API_BASE,
  API_ERROR_MESSAGES,
  PREFER_STATIC_NODES,
  STATIC_NODES_URL,
} from '@/shared/config';
import { nodesResponseSchema } from '../model/node.schema';
import type { NodesLoadResult, NodesResponse } from '../types';

/**
 * REST-клиент для `/api/org-tree` со статическим fallback.
 */
export class NodesService {
  /**
   * Загружает узлы: API → при ошибке (или сразу) статичный JSON.
   * Уважайте `signal` — при abort не уходим в fallback.
   *
   * @param {AbortSignal} [signal] - сигнал отмены (React Query)
   * @returns {Promise<NodesLoadResult>} данные и источник
   */
  async getAll(signal?: AbortSignal): Promise<NodesLoadResult> {
    if (PREFER_STATIC_NODES) {
      const data = await this.loadStatic(signal);

      return { data, source: 'static' };
    }

    try {
      const data = await this.loadApi(signal);

      return { data, source: 'api' };
    } catch (error) {
      if (signal?.aborted || isAbortError(error)) {
        throw error;
      }

      const data = await this.loadStatic(signal);

      return { data, source: 'static' };
    }
  }

  /**
   * @param {AbortSignal} [signal] - сигнал отмены
   * @returns {Promise<NodesResponse>} ответ `/api/org-tree`
   */
  private async loadApi(signal?: AbortSignal): Promise<NodesResponse> {
    const data = await fetchJson(`${API_BASE}/org-tree`, { signal });

    return this.parse(data);
  }

  /**
   * @param {AbortSignal} [signal] - сигнал отмены
   * @returns {Promise<NodesResponse>} `public/data/nodes.json`
   */
  private async loadStatic(signal?: AbortSignal): Promise<NodesResponse> {
    const data = await fetchJson(STATIC_NODES_URL, { signal });

    return this.parse(data);
  }

  /**
   * @param {unknown} data - сырой JSON
   * @returns {NodesResponse} валидированный ответ
   */
  private parse(data: unknown): NodesResponse {
    const parsed = nodesResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(
        API_ERROR_MESSAGES.invalidNodesResponse(parsed.error.message),
      );
    }

    return parsed.data;
  }
}

export const nodesService = new NodesService();
