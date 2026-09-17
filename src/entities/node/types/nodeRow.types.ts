import type { Node } from './node.types';
import type { TableColumnId } from '@/shared/types';

export type NodeRowProps = {
  /** Узел строки. */
  node: Node;
  /** Глубина в дереве (0 = корень). */
  depth: number;
  /** Подсвечена ли строка после патча. */
  highlighted: boolean;
  /** Выбрана ли строка. */
  selected: boolean;
  /** Порядок колонок таблицы. */
  columnOrder: readonly TableColumnId[];
  /** Колбэк выбора строки. */
  onSelect?: () => void;
};
