import type { ChildrenMap, NodeMap, Node } from '@/types/index.js';

/**
 * Пересчёт агрегатов узлов и индекс детей.
 * - headcount / budget: сумма детей
 * - performance: среднее, взвешенное по headcount (у листа — своё значение)
 */
export class AggregatorService {
  /**
   * Ограничивает performance диапазоном 0–100 и округляет.
   *
   * @param {number} value - исходное значение performance
   * @returns {number} значение в диапазоне 0–100
   */
  private clampPerformance(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  /**
   * Пересчитывает агрегаты для узла и всех предков.
   *
   * @param {NodeMap} byId - индекс узлов по id
   * @param {ChildrenMap} children - индекс детей по parentId
   * @param {string} startId - id узла, с которого начинается пересчёт
   * @returns {Node[]} изменённые узлы (узел + предки), от листа вверх
   */
  recomputeAncestors(
    byId: NodeMap,
    children: ChildrenMap,
    startId: string,
  ): Node[] {
    const patched: Node[] = [];
    let currentId: string | null = startId;

    while (currentId) {
      const node = byId.get(currentId);

      if (!node) {
        break;
      }

      const childIds = children.get(currentId) ?? [];
      const updatedAt = new Date().toISOString();

      if (childIds.length === 0) {
        const next: Node = { ...node, updatedAt };
        byId.set(currentId, next);
        patched.push(next);
      } else {
        let headcount = 0;
        let budget = 0;
        let weightedPerformance = 0;

        for (const childId of childIds) {
          const child = byId.get(childId);

          if (!child) {
            continue;
          }

          headcount += child.headcount;
          budget += child.budget;
          weightedPerformance += child.performance * child.headcount;
        }

        const performance =
          headcount > 0
            ? this.clampPerformance(weightedPerformance / headcount)
            : node.performance;

        const next: Node = {
          ...node,
          headcount,
          budget,
          performance,
          updatedAt,
        };
        byId.set(currentId, next);
        patched.push(next);
      }

      currentId = node.parentId;
    }

    return patched;
  }

  /**
   * Строит индекс детей по `parentId`.
   *
   * @param {Iterable<Node>} nodes - плоский список узлов
   * @returns {ChildrenMap} карта parentId → id детей
   */
  buildChildrenIndex(nodes: Iterable<Node>): ChildrenMap {
    const children: ChildrenMap = new Map();

    for (const node of nodes) {
      const list = children.get(node.parentId) ?? [];
      list.push(node.id);
      children.set(node.parentId, list);
    }

    return children;
  }
}

export const aggregatesService = new AggregatorService();
