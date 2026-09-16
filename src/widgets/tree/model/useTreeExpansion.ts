import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Node } from '@/entities/node';
import { buildTree, defaultExpandedIds } from '@/shared/lib';

/**
 * Управляет деревом и набором раскрытых узлов.
 *
 * @param {Node[]} nodes - плоский список узлов
 * @returns {{
 *   roots: TreeNode[],
 *   expandedIds: ReadonlySet<string>,
 *   toggle: (id: string) => void
 * }} корни, раскрытые id и переключатель
 */
export function useTreeExpansion(nodes: Node[]) {
  const roots = useMemo(() => buildTree(nodes), [nodes]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || roots.length === 0) {
      return;
    }

    setExpandedIds(defaultExpandedIds(roots));
    setInitialized(true);
  }, [roots, initialized]);

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return {
    roots,
    expandedIds: expandedIds as ReadonlySet<string>,
    toggle,
  };
}
