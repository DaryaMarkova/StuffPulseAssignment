import type { Node } from '@/entities/node/types';

export type TableProps = {
  /** Плоский список узлов. */
  nodes: Node[];
  /** Ограничение строк поддеревом или `null` для всех. */
  scopeIds: ReadonlySet<string> | null;
  /** Id выбранного узла или `null`. */
  selectedId: string | null;
  /** Id узлов с подсветкой патча. */
  flashIds: ReadonlySet<string>;
  /** Колбэк выбора узла. */
  onSelect: (id: string) => void;
};
