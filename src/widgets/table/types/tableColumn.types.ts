import type { TableColumnId } from '@/shared/types';

export type TableColumn = {
  id: TableColumnId;
  label: string;
  tooltip: string;
  minWidth: number;
  defaultWidth: number;
  nonNumeric?: boolean;
};
