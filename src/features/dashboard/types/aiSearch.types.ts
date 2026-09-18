export type MetricCompareOp = 'gt' | 'gte' | 'lt' | 'lte' | 'eq';

export type MetricConstraint = {
  op: MetricCompareOp;
  /** Нижняя граница (или единственное значение для сравнения). */
  value: number;
  /** Верхняя граница для диапазона `between` / mid. */
  max?: number;
};

/**
 * Структурированный фильтр из естественного языка.
 * Применяется на клиенте к уже загруженным узлам.
 */
export type StructuredNodeFilter = {
  nameIncludes?: string;
  performance?: MetricConstraint;
  headcount?: MetricConstraint;
  budget?: MetricConstraint;
};

export type AiSearchMode = 'none' | 'structured' | 'text';

export type AiSearchResult = {
  nodes: import('@/entities/node').Node[];
  mode: AiSearchMode;
  filter: StructuredNodeFilter | null;
};
