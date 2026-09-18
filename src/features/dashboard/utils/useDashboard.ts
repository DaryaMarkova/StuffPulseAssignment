import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getAggregatedNodes,
  nodesService,
  type NodesDataSource,
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
 * Применяет SSE-патч к кэшированному ответу `/api/org-tree`.
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

type DashboardQueryData = NodesResponse & {
  source: NodesDataSource;
};

/**
 * Загружает узлы (API или статичный JSON), держит SSE-патчи в кэше
 * и отслеживает статус + подсветку узлов/ячеек.
 *
 * @returns {{
 *   nodes: Node[],
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   isFetched: boolean,
 *   status: ConnectionStatus,
 *   dataSource: NodesDataSource | null,
 *   flashIds: ReadonlySet<string>,
 *   flashCells: ReadonlySet<string>
 * }} состояние дашборда
 */
export function useDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: NODES_QUERY_KEY,
    queryFn: async ({ signal }): Promise<DashboardQueryData> => {
      const { data, source } = await nodesService.getAll(signal);

      return {
        nodes: getAggregatedNodes(data.nodes),
        source,
      };
    },
    staleTime: NODES_STALE_TIME_MS,
  });

  const dataSource = query.data?.source ?? null;

  const [status, setStatus] = useState<ConnectionStatus>(
    ConnectionStatus.Disconnected,
  );
  
  const [flashIds, setFlashIds] = useState<ReadonlySet<string>>(new Set());
  const [flashCells, setFlashCells] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (!query.isSuccess || dataSource === 'static') {
      setStatus(ConnectionStatus.Disconnected);

      return;
    }

    const flashTimers = new Set<number>();

    eventsService.start({
      onStatus: setStatus,
      onPatch: (patch) => {
        const current =
          queryClient.getQueryData<DashboardQueryData>(NODES_QUERY_KEY);
        const { nodeIds, cellKeys } = collectFlashKeys(current, patch);

        queryClient.setQueryData<DashboardQueryData>(NODES_QUERY_KEY, (data) => {
          if (!data) {
            return data;
          }

          return {
            ...applyPatch(data, patch),
            source: data.source,
          };
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

        const timerId = window.setTimeout(() => {
          flashTimers.delete(timerId);

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

        flashTimers.add(timerId);
      },
    });

    return () => {
      for (const timerId of flashTimers) {
        window.clearTimeout(timerId);
      }

      flashTimers.clear();
      eventsService.stop();
    };
  }, [query.isSuccess, dataSource, queryClient]);

  return {
    nodes: query.data?.nodes ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetched: query.isFetched,
    status,
    dataSource,
    flashIds,
    flashCells,
  };
}
