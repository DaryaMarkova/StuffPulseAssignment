import { ERROR_MESSAGES } from '@/constants/messages.js';
import { createSeedNodes } from '@/data/index.js';
import { aggregatesService } from '@/services/aggregate.service.js';
import type { LeafPatch, Node } from '@/types/index.js';

/**
 * In-memory хранилище орг-дерева: чтение узлов и патчи листьев с пересчётом предков.
 */
class NodeStore {
  private byId: Map<string, Node>;
  private children: Map<string | null, string[]>;

  /**
   * Инициализирует store из списка узлов и строит индекс детей.
   *
   * @param {Node[]} nodes - начальный плоский список узлов
   */
  constructor(nodes: Node[]) {
    this.byId = new Map(nodes.map((node) => [node.id, node]));
    this.children = aggregatesService.buildChildrenIndex(nodes);
  }

  /**
   * Возвращает все узлы плоским списком.
   *
   * @returns {Node[]} копия списка узлов
   */
  getAll(): Node[] {
    return [...this.byId.values()];
  }

  /**
   * Возвращает узел по id или `undefined`, если не найден.
   *
   * @param {string} id - идентификатор узла
   * @returns {Node | undefined} найденный узел или `undefined`
   */
  getById(id: string): Node | undefined {
    return this.byId.get(id);
  }

  /**
   * Возвращает id листьев (узлы без детей).
   *
   * @returns {string[]} идентификаторы листовых узлов
   */
  getLeafIds(): string[] {
    return this.getAll()
      .filter((node) => !this.children.get(node.id)?.length)
      .map((node) => node.id);
  }

  /**
   * Применяет патч метрик к листу и пересчитывает только узел и его предков.
   *
   * @param {string} id - идентификатор листового узла
   * @param {LeafPatch} patch - частичное обновление метрик
   * @returns {Node[]} изменённые узлы (лист + предки)
   */
  applyLeafPatch(id: string, patch: LeafPatch): Node[] {
    const node = this.byId.get(id);

    if (!node) {
      throw new Error(ERROR_MESSAGES.nodeNotFoundWithId(id));
    }

    const childIds = this.children.get(id) ?? [];

    if (childIds.length > 0) {
      throw new Error(ERROR_MESSAGES.onlyLeafPatch(id));
    }

    const ownHeadcount = patch.headcount ?? node.ownHeadcount;
    const ownBudget = patch.budget ?? node.ownBudget;
    const ownPerformance =
      patch.performance === undefined
        ? node.ownPerformance
        : Math.max(0, Math.min(100, patch.performance));

    const next: Node = {
      ...node,
      ...patch,
      ownHeadcount,
      ownBudget,
      ownPerformance,
      headcount: ownHeadcount,
      budget: ownBudget,
      performance: ownPerformance,
      updatedAt: new Date().toISOString(),
    };

    this.byId.set(id, next);

    return aggregatesService.recomputeAncestors(this.byId, this.children, id);
  }
}

export const store = new NodeStore(createSeedNodes());
