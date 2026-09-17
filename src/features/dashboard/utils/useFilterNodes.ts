import { useMemo, useState } from 'react';
import type { Node } from '@/entities/node';
import { getFilterNodesByName, useDebouncedValue } from '@/shared/lib';
import { FILTER_DEBOUNCE_MS } from '../constants';

/**
 * Держит query фильтра, debounce и отфильтрованный список узлов.
 *
 * @param {Node[]} nodes - исходный плоский список
 * @returns {{
 *   filterQuery: string,
 *   setFilterQuery: (value: string) => void,
 *   filteredNodes: Node[],
 *   filterEmpty: boolean
 * }} состояние фильтрации
 */
export function useFilterNodes(nodes: Node[]) {
  const [filterQuery, setFilterQuery] = useState('');
  
  const debouncedFilterQuery = useDebouncedValue(
    filterQuery,
    FILTER_DEBOUNCE_MS,
  );

  const filteredNodes = useMemo(
    () => getFilterNodesByName(nodes, debouncedFilterQuery),
    [nodes, debouncedFilterQuery],
  );

  const hasFilter = debouncedFilterQuery.trim().length > 0;
  const filterEmpty = hasFilter && filteredNodes.length === 0;

  return {
    filterQuery,
    setFilterQuery,
    filteredNodes,
    filterEmpty,
  };
}
