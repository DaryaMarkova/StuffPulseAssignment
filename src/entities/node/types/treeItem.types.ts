import type { Node } from './node.types';

export type TreeItemProps = {
  /** Узел дерева. */
  node: Node;
  /** Глубина в дереве (0 = корень). */
  depth: number;
  /** Есть ли дочерние узлы. */
  hasChildren: boolean;
  /** Раскрыт ли узел. */
  expanded: boolean;
  /** Выбран ли узел. */
  selected: boolean;
  /** Подсвечен ли узел после патча. */
  highlighted: boolean;
  /** Переключает раскрытие. */
  onToggle: () => void;
  /** Выбирает узел. */
  onSelect: () => void;
};
