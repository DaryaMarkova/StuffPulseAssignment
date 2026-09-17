import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Node } from '@/entities/node';
import {
  buildTree,
  collectAncestorIds,
  defaultExpandedIds,
} from '@/shared/lib';

/**
 * Управляет деревом и набором раскрытых узлов.
 * Второй уровень (divisions) открыт с первого рендера.
 * При выборе узла раскрывает путь к нему от корня.
 *
 * @param {Node[]} nodes - плоский список узлов
 * @param {string | null} selectedId - выбранный узел
 * @returns {{
 *   roots: TreeNode[],
 *   expandedIds: ReadonlySet<string>,
 *   toggle: (id: string) => void
 * }} корни, раскрытые id и переключатель
 */
export function useTreeExpansion(nodes: Node[], selectedId: string | null) {
  const roots = useMemo(() => buildTree(nodes), [nodes]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    defaultExpandedIds(buildTree(nodes)),
  );

  useEffect(() => {

    if (roots.length === 0) {
      return;
    }

    setExpandedIds((prev) => {

      if (prev.size > 0) {
        return prev;
      }

      return defaultExpandedIds(roots);
    });
  }, [roots]);

  useEffect(() => {

    if (!selectedId) {
      return;
    }

    const ancestors = collectAncestorIds(nodes, selectedId);

    if (ancestors.length === 0) {
      return;
    }

    setExpandedIds((prev) => {
      let changed = false;
      const next = new Set(prev);

      for (const id of ancestors) {

        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }

      }

      return changed ? next : prev;
    });
  }, [selectedId, nodes]);

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
