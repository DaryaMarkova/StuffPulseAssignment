import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getAggregatedNodes,
  nodesService,
  type NodesResponse,
  type PatchEvent,
} from '@/entities/node';

import {
  CELL_FADE_OUT_MS,
  ConnectionStatus,
  NODES_QUERY_KEY,
  NODES_STALE_TIME_MS,
} from '@/shared/config';

import { eventsService } from '../api/events.service';
import { collectFlashKeys } from './flashCells';

/**
 * Применяет SSE-патч к кэшированному ответу `/api/nodes`.
 * Сервер уже присылает пересчитанные агрегаты для листа и предков —
 * полная клиентская агрегация здесь не запускается.
 *
 * @param {NodesResponse} current - текущие данные в кэше
 * @param {PatchEvent} patch - событие с обновлёнными узлами
 * @returns {NodesResponse} обновлённый ответ
 */
function applyPatch(current: NodesResponse, patch: PatchEvent): NodesResponse {
  const byId = new Map(current.nodes.map((node) => [node.id, node]));

  for (const node of patch.nodes) {
    byId.set(node.id, node);
  }

  return { nodes: Array.from(byId.values()) };
}

/**
 * Загружает узлы (агрегация один раз в `queryFn`), держит SSE-патчи в кэше
 * и отслеживает статус + подсветку узлов/ячеек.
 *
 * @returns {{
 *   nodes: Node[],
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   isFetched: boolean,
 *   status: ConnectionStatus,
 *   flashIds: ReadonlySet<string>,
 *   flashCells: ReadonlySet<string>
 * }} состояние дашборда
 */
export function useDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: NODES_QUERY_KEY,
    queryFn: async (): Promise<NodesResponse> => {
      const data = await nodesService.getAll();

      return { nodes: getAggregatedNodes(data.nodes) };
    },
    staleTime: NODES_STALE_TIME_MS,
  });

  const [status, setStatus] = useState<ConnectionStatus>(
    ConnectionStatus.Disconnected,
  );
  const [flashIds, setFlashIds] = useState<ReadonlySet<string>>(new Set());
  const [flashCells, setFlashCells] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    eventsService.start({
      onStatus: setStatus,
      onPatch: (patch) => {
        const current =
          queryClient.getQueryData<NodesResponse>(NODES_QUERY_KEY);
        const { nodeIds, cellKeys } = collectFlashKeys(current, patch);

        queryClient.setQueryData<NodesResponse>(NODES_QUERY_KEY, (data) => {

          if (!data) {
            return data;
          }

          return applyPatch(data, patch);
        });

        setFlashIds((prev) => {
          const next = new Set(prev);

          for (const id of nodeIds) {
            next.add(id);
          }

          return next;
        });

        setFlashCells((prev) => {
          const next = new Set(prev);

          for (const key of cellKeys) {
            next.add(key);
          }

          return next;
        });

        window.setTimeout(() => {
          setFlashIds((prev) => {
            const next = new Set(prev);

            for (const id of nodeIds) {
              next.delete(id);
            }

            return next;
          });

          setFlashCells((prev) => {
            const next = new Set(prev);

            for (const key of cellKeys) {
              next.delete(key);
            }

            return next;
          });
        }, CELL_FADE_OUT_MS);
      },
    });

    return () => {
      eventsService.stop();
    };
  }, [queryClient]);

  return {
    nodes: query.data?.nodes ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetched: query.isFetched,
    status,
    flashIds,
    flashCells,
  };
}
