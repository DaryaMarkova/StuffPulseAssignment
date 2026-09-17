import type { AggregateMetrics, Node } from '../types';

/**
 * Ограничивает performance диапазоном 0–100 и округляет.
 *
 * @param {number} value - исходное значение
 * @returns {number} значение в диапазоне 0–100
 */
function clampPerformance(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Строит индекс детей по `parentId`.
 *
 * @param {Node[]} nodes - плоский список узлов
 * @returns {Map<string | null, string[]>} parentId → id детей
 */
function buildChildrenIndex(nodes: Node[]): Map<string | null, string[]> {
  const children = new Map<string | null, string[]>();

  for (const node of nodes) {
    const list = children.get(node.parentId) ?? [];
    list.push(node.id);
    children.set(node.parentId, list);
  }

  return children;
}

/**
 * Считает агрегаты снизу вверх:
 * - headcount / budget — own узла + все потомки;
 * - performance — среднее, взвешенное по headcount.
 *
 * @param {Node[]} nodes - плоский список узлов после загрузки / патча
 * @returns {Node[]} новый список с пересчитанными метриками
 */
export function getAggregatedNodes(nodes: Node[]): Node[] {

  if (nodes.length === 0) {
    return nodes;
  }

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const children = buildChildrenIndex(nodes);
  const aggregates = new Map<string, AggregateMetrics>();

  /**
   * Рекурсивно считает агрегаты поддерева и кэширует в `aggregates`.
   *
   * @param {string} id - id текущего узла
   * @returns {AggregateMetrics} агрегаты поддерева
   */
  const aggregateSubtree = (id: string): AggregateMetrics => {
    const cached = aggregates.get(id);

    if (cached) {
      return cached;
    }

    const node = byId.get(id);

    if (!node) {
      const empty: AggregateMetrics = {
        headcount: 0,
        budget: 0,
        performance: 0,
      };

      return empty;
    }

    const childIds = children.get(id) ?? [];

    let headcount = node.ownHeadcount;
    let budget = node.ownBudget;
    let weightedPerformance = node.ownPerformance * node.ownHeadcount;

    for (const childId of childIds) {
      const child = aggregateSubtree(childId);
      headcount += child.headcount;
      budget += child.budget;
      weightedPerformance += child.performance * child.headcount;
    }

    const performance =
      headcount > 0
        ? clampPerformance(weightedPerformance / headcount)
        : node.ownPerformance;

    const next: AggregateMetrics = { headcount, budget, performance };
    aggregates.set(id, next);

    return next;
  };

  for (const rootId of children.get(null) ?? []) {
    aggregateSubtree(rootId);
  }

  for (const node of nodes) {
    if (!aggregates.has(node.id)) {
      aggregateSubtree(node.id);
    }
  }

  return nodes.map((node) => {
    const metrics = aggregates.get(node.id);

    if (!metrics) {
      return node;
    }

    return {
      ...node,
      headcount: metrics.headcount,
      budget: metrics.budget,
      performance: metrics.performance,
    };
  });
}
