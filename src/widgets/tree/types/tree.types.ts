import type { Node } from '@/entities/node/types';

export type TreeProps = {
  /** Плоский список узлов. */
  nodes: Node[];
  /** Id выбранного узла или `null`. */
  selectedId: string | null;
  /** Id узлов с подсветкой патча. */
  flashIds: ReadonlySet<string>;
  /** Ключи подсветки метрик (`nodeId:columnId`). */
  flashCells: ReadonlySet<string>;
  /** Колбэк выбора узла. */
  onSelect: (id: string) => void;
};
