import { fetchJson } from '@/shared/api';
import { API_BASE, API_ERROR_MESSAGES } from '@/shared/config';
import { nodesResponseSchema } from '../model/node.schema';
import type { NodesResponse } from '../types';

/**
 * REST-клиент для `/api/nodes`.
 */
export class NodesService {
  /**
   * Загружает и валидирует плоский список узлов.
   *
   * @returns {Promise<NodesResponse>} ответ API с массивом узлов
   */
  async getAll(): Promise<NodesResponse> {
    const data = await fetchJson(`${API_BASE}/nodes`);
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
