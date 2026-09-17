import type { Node } from './node.types';
import type { TableColumnId } from '@/shared/types';

export type NodeRowProps = {
  /** Узел строки. */
  node: Node;
  /** Глубина в дереве (0 = корень). */
  depth: number;
  /** Колонки с подсветкой изменившихся метрик. */
  flashColumns: ReadonlySet<TableColumnId>;
  /** Выбрана ли строка. */
  selected: boolean;
  /** Порядок колонок таблицы. */
  columnOrder: readonly TableColumnId[];
  /** Колбэк выбора строки. */
  onSelect?: () => void;
};
