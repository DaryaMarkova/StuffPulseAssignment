import type { Node } from '@/entities/node';

/**
 * Оставляет совпавшие узлы и всех их предков (связное дерево).
 *
 * @param {Node[]} nodes - плоский список
 * @param {ReadonlySet<string>} matchedIds - id совпадений
 * @returns {Node[]} отфильтрованный список
 */
export function keepMatchedWithAncestors(
  nodes: Node[],
  matchedIds: ReadonlySet<string>,
): Node[] {
  if (matchedIds.size === 0) {
    return [];
  }

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const keepIds = new Set(matchedIds);

  for (const id of matchedIds) {
    let current = byId.get(id);

    while (current?.parentId) {
      keepIds.add(current.parentId);
      current = byId.get(current.parentId);
    }
  }

  return nodes.filter((node) => keepIds.has(node.id));
}

/**
 * Фильтрует узлы по подстроке в `name` (без учёта регистра).
 * Сохраняет предков совпавших узлов, чтобы дерево оставалось связным.
 *
 * @param {Node[]} nodes - плоский список узлов
 * @param {string} query - строка поиска
 * @returns {Node[]} отфильтрованный список
 */
export function getFilterNodesByName(nodes: Node[], query: string): Node[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return nodes;
  }

  const matchedIds = new Set<string>();

  for (const node of nodes) {
    if (node.name.toLowerCase().includes(normalized)) {
      matchedIds.add(node.id);
    }
  }

  return keepMatchedWithAncestors(nodes, matchedIds);
}
