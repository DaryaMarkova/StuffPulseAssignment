import type { TreeNode } from '@/shared/types';

export type BranchProps = {
  /** Узлы текущего уровня. */
  nodes: TreeNode[];
  /** Id раскрытых узлов. */
  expandedIds: ReadonlySet<string>;
  /** Id выбранного узла или `null`. */
  selectedId: string | null;
  /** Id узлов с подсветкой патча. */
  flashIds: ReadonlySet<string>;
  /** Переключает раскрытие узла. */
  onToggle: (id: string) => void;
  /** Выбирает узел. */
  onSelect: (id: string) => void;
  /** Открыта ли ветка. */
  open: boolean;
};
