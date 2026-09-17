import type { Node } from '@/entities/node';
import type { TreeNode } from '@/shared/types';

/**
 * Строит лес из плоского списка с `parentId`; корни первыми.
 *
 * @param {Node[]} nodes - плоский список узлов
 * @returns {TreeNode[]} корневые узлы с заполненными `children` и `depth`
 */
export function buildTree(nodes: Node[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();

  for (const node of nodes) {
    byId.set(node.id, { ...node, children: [], depth: 0 });
  }

  const roots: TreeNode[] = [];

  for (const node of byId.values()) {

    if (node.parentId === null) {
      roots.push(node);
      continue;
    }

    const parent = byId.get(node.parentId);

    if (!parent) {
      roots.push(node);
      continue;
    }

    parent.children.push(node);
  }

  /**
   * Рекурсивно проставляет глубину узлам.
   *
   * @param {TreeNode[]} items - узлы текущего уровня
   * @param {number} depth - глубина текущего уровня
   * @returns {void}
   */
  const assignDepth = (items: TreeNode[], depth: number): void => {
    for (const item of items) {
      item.depth = depth;
      assignDepth(item.children, depth + 1);
    }
  };

  assignDepth(roots, 0);

  return roots;
}

/**
 * Возвращает видимые строки с учётом раскрытых родителей.
 *
 * @param {TreeNode[]} roots - корни дерева
 * @param {ReadonlySet<string>} expandedIds - id раскрытых узлов
 * @returns {TreeNode[]} плоский список видимых узлов
 */
export function flattenVisible(
  roots: TreeNode[],
  expandedIds: ReadonlySet<string>,
): TreeNode[] {
  const rows: TreeNode[] = [];

  /**
   * Обходит дерево и добавляет видимые узлы.
   *
   * @param {TreeNode[]} items - узлы текущего уровня
   * @returns {void}
   */
  const walk = (items: TreeNode[]): void => {
    for (const item of items) {
      rows.push(item);

      if (item.children.length > 0 && expandedIds.has(item.id)) {
        walk(item.children);
      }

    }
  };

  walk(roots);
  return rows;
}

/**
 * Возвращает набор раскрытых id по умолчанию (корни открыты).
 *
 * @param {TreeNode[]} roots - корни дерева
 * @returns {Set<string>} id раскрытых узлов
 */
export function defaultExpandedIds(roots: TreeNode[]): Set<string> {
  const expanded = new Set<string>();

  for (const root of roots) {
    expanded.add(root.id);
  }

  return expanded;
}

/**
 * Собирает id узла и всех его потомков (включительно).
 *
 * @param {TreeNode[]} roots - корни дерева
 * @param {string} rootId - id корня поддерева
 * @returns {Set<string>} id узла и потомков
 */
export function collectSubtreeIds(
  roots: TreeNode[],
  rootId: string,
): Set<string> {
  const ids = new Set<string>();

  /**
   * Ищет узел по id в лесу.
   *
   * @param {TreeNode[]} items - узлы текущего уровня
   * @returns {TreeNode | null} найденный узел или `null`
   */
  const find = (items: TreeNode[]): TreeNode | null => {
    for (const item of items) {

      if (item.id === rootId) {
        return item;
      }

      const nested = find(item.children);

      if (nested) {
        return nested;
      }

    }
    return null;
  };

  /**
   * Добавляет узел и потомков в `ids`.
   *
   * @param {TreeNode} node - корень поддерева
   * @returns {void}
   */
  const collect = (node: TreeNode): void => {
    ids.add(node.id);
    for (const child of node.children) {
      collect(child);
    }
  };

  const start = find(roots);

  if (start) {
    collect(start);
  }

  return ids;
}

/**
 * Собирает id всех предков узла (от родителя к корню).
 *
 * @param {Node[]} nodes - плоский список узлов
 * @param {string} nodeId - id целевого узла
 * @returns {string[]} id предков
 */
export function collectAncestorIds(nodes: Node[], nodeId: string): string[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const ancestors: string[] = [];
  let current = byId.get(nodeId);

  while (current?.parentId) {
    ancestors.push(current.parentId);
    current = byId.get(current.parentId);
  }

  return ancestors;
}

