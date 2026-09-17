import type { TableColumnId } from '@/shared/types';
import type { SortDirection } from '../constants';

export type TableSort = {
  columnId: TableColumnId;
  direction: SortDirection;
};
