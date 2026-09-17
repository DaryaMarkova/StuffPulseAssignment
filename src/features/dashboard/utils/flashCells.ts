import type { Node, NodesResponse, PatchEvent } from '@/entities/node';
import { TableColumnId } from '@/shared/config';

export const FLASH_METRIC_COLUMNS = [
  TableColumnId.Headcount,
  TableColumnId.Budget,
  TableColumnId.Performance,
] as const;

export type FlashMetricColumn = (typeof FLASH_METRIC_COLUMNS)[number];

/**
 * Ключ подсветки ячейки: `nodeId:columnId`.
 *
 * @param {string} nodeId - id узла
 * @param {FlashMetricColumn} columnId - метрика
 * @returns {string} ключ для Set
 */
export function flashCellKey(
  nodeId: string,
  columnId: FlashMetricColumn,
): string {
  return `${nodeId}:${columnId}`;
}

/**
 * Собирает ключи подсветки для изменившихся метрик в патче.
 *
 * @param {NodesResponse | undefined} current - текущий кэш
 * @param {PatchEvent} patch - SSE-патч
 * @returns {{ nodeIds: string[], cellKeys: string[] }} id узлов и ключи ячеек
 */
export function collectFlashKeys(
  current: NodesResponse | undefined,
  patch: PatchEvent,
): { nodeIds: string[]; cellKeys: string[] } {
  const byId = new Map(
    (current?.nodes ?? []).map((node: Node) => [node.id, node]),
  );
  const nodeIds: string[] = [];
  const cellKeys: string[] = [];

  for (const node of patch.nodes) {
    nodeIds.push(node.id);
    const prev = byId.get(node.id);

    if (!prev) {
      for (const columnId of FLASH_METRIC_COLUMNS) {
        cellKeys.push(flashCellKey(node.id, columnId));
      }
      continue;
    }

    if (prev.headcount !== node.headcount) {
      cellKeys.push(flashCellKey(node.id, TableColumnId.Headcount));
    }

    if (prev.budget !== node.budget) {
      cellKeys.push(flashCellKey(node.id, TableColumnId.Budget));
    }

    if (prev.performance !== node.performance) {
      cellKeys.push(flashCellKey(node.id, TableColumnId.Performance));
    }
  }

  return { nodeIds, cellKeys };
}
