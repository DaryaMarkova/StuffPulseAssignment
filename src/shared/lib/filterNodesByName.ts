import type { Node } from '@/entities/node';

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

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const matchedIds = new Set<string>();

  for (const node of nodes) {

    if (node.name.toLowerCase().includes(normalized)) {
      matchedIds.add(node.id);
    }

  }

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
