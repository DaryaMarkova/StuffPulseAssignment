import { useMemo, useState } from 'react';
import type { Node } from '@/entities/node';
import { useDebouncedValue } from '@/shared/lib';
import { FILTER_DEBOUNCE_MS } from '../constants';
import type { AiSearchMode, StructuredNodeFilter } from '../types';
import { aiSearchService } from './aiSearch.service';

/**
 * NL-поиск → структурированный фильтр на клиенте; fallback — текст по имени.
 *
 * @param {Node[]} nodes - исходный плоский список
 * @returns {{
 *   filterQuery: string,
 *   setFilterQuery: (value: string) => void,
 *   filteredNodes: Node[],
 *   filterEmpty: boolean,
 *   searchMode: AiSearchMode,
 *   structuredFilter: StructuredNodeFilter | null
 * }} состояние фильтрации
 */
export function useFilterNodes(nodes: Node[]): {
  filterQuery: string;
  setFilterQuery: (value: string) => void;
  filteredNodes: Node[];
  filterEmpty: boolean;
  searchMode: AiSearchMode;
  structuredFilter: StructuredNodeFilter | null;
} {
  const [filterQuery, setFilterQuery] = useState('');

  const debouncedFilterQuery = useDebouncedValue(
    filterQuery,
    FILTER_DEBOUNCE_MS,
  );

  const result = useMemo(
    () => aiSearchService.search(nodes, debouncedFilterQuery),
    [nodes, debouncedFilterQuery],
  );

  const hasFilter = debouncedFilterQuery.trim().length > 0;
  const filterEmpty = hasFilter && result.nodes.length === 0;

  return {
    filterQuery,
    setFilterQuery,
    filteredNodes: result.nodes,
    filterEmpty,
    searchMode: result.mode,
    structuredFilter: result.filter,
  };
}
