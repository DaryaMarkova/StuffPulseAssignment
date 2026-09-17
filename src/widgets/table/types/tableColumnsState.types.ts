import type { TableColumnId } from '@/shared/types';

export type ColumnWidths = Record<TableColumnId, number>;

export type ResizeDrag = {
  columnId: TableColumnId;
  startX: number;
  startWidth: number;
};
