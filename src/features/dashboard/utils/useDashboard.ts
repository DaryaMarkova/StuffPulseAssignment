import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  getAggregatedNodes,
  nodesService,
  type Node,
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

/**
 * Применяет SSE-патч к кэшированному ответу `/api/nodes`.
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
 * Загружает узлы, держит SSE-патчи в кэше и отслеживает статус + flash ids.
 *
 * @returns {{
 *   nodes: Node[],
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   isFetched: boolean,
 *   status: ConnectionStatus,
 *   flashIds: ReadonlySet<string>
 * }} состояние дашборда
 */
export function useDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: NODES_QUERY_KEY,
    queryFn: () => nodesService.getAll(),
    staleTime: NODES_STALE_TIME_MS,
  });

  const [status, setStatus] = useState<ConnectionStatus>(
    ConnectionStatus.Disconnected,
  );
  const [flashIds, setFlashIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    eventsService.start({
      onStatus: setStatus,
      onPatch: (patch) => {
        queryClient.setQueryData<NodesResponse>(NODES_QUERY_KEY, (current) => {

          if (!current) {
            return current;
          }

          return applyPatch(current, patch);
        });

        const ids = patch.nodes.map((node: Node) => node.id);
        
        setFlashIds((prev) => {
          const next = new Set(prev);
          for (const id of ids) {
            next.add(id);
          }
          return next;
        });

        window.setTimeout(() => {
          setFlashIds((prev) => {
            const next = new Set(prev);
            
            for (const id of ids) {
              next.delete(id);
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

  const loadedNodes = query.data?.nodes;
  const nodes = useMemo(
    () => (loadedNodes ? getAggregatedNodes(loadedNodes) : []),
    [loadedNodes],
  );

  return {
    nodes,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetched: query.isFetched,
    status,
    flashIds,
  };
}
