import { nodesResponseSchema } from '../model/node.schema';
import type { NodesResponse } from '../types';
import { API_BASE } from '@/shared/config';
import { fetchJson } from '@/shared/api';

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
      throw new Error(`Invalid nodes response: ${parsed.error.message}`);
    }

    return parsed.data;
  }
}

export const nodesService = new NodesService();
