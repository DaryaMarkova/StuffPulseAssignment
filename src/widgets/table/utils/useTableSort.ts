import { useCallback, useState } from 'react';
import { TableColumnId } from '@/shared/config';
import type { TreeNode } from '@/shared/types';
import { SortDirection } from '../constants';
import type { TableSort } from '../types';

/**
 * Сравнивает две строки таблицы по колонке.
 *
 * @param {TreeNode} a - первая строка
 * @param {TreeNode} b - вторая строка
 * @param {TableColumnId} columnId - id колонки
 * @returns {number} результат сравнения
 */
function compareRows(
  a: TreeNode,
  b: TreeNode,
  columnId: TableColumnId,
): number {
  switch (columnId) {
    case TableColumnId.Name:
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    case TableColumnId.Level:
      return a.depth - b.depth;
    case TableColumnId.Headcount:
      return a.headcount - b.headcount;
    case TableColumnId.Budget:
      return a.budget - b.budget;
    case TableColumnId.Performance:
      return a.performance - b.performance;
    default:
      return 0;
  }
}

/**
 * Сортирует строки по состоянию сортировки.
 *
 * @param {TreeNode[]} rows - исходные строки
 * @param {TableSort | null} sort - активная сортировка или `null`
 * @returns {TreeNode[]} новый отсортированный массив
 */
export function sortTableRows(
  rows: TreeNode[],
  sort: TableSort | null,
): TreeNode[] {

  if (!sort) {
    return rows;
  }

  const direction = sort.direction === SortDirection.Asc ? 1 : -1;

  return [...rows].sort((a, b) => {
    const result = compareRows(a, b, sort.columnId);
    

    if (result !== 0) {
      return result * direction;
    }

    return a.id.localeCompare(b.id) * direction;
  });
}

/**
 * Управляет сортировкой таблицы: клик — по возрастанию, двойной клик — реверс.
 *
 * @returns состояние сортировки и обработчики
 */
export function useTableSort() {
  const [sort, setSort] = useState<TableSort | null>(null);

  /**
   * Сортирует колонку по возрастанию.
   *
   * @param {TableColumnId} columnId - id колонки
   * @returns {void}
   */
  const sortAscending = useCallback((columnId: TableColumnId) => {
    setSort({ columnId, direction: SortDirection.Asc });
  }, []);

  /**
   * Переключает направление сортировки для колонки (двойной клик).
   *
   * @param {TableColumnId} columnId - id колонки
   * @returns {void}
   */
  const reverseSort = useCallback((columnId: TableColumnId) => {
    setSort((prev) => {

      if (!prev || prev.columnId !== columnId) {
        return { columnId, direction: SortDirection.Desc };
      }

      return {
        columnId,
        direction:
          prev.direction === SortDirection.Asc
            ? SortDirection.Desc
            : SortDirection.Asc,
      };
    });
  }, []);

  return {
    sort,
    sortAscending,
    reverseSort,
  };
}
