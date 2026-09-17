import { TableColumnId } from '@/shared/config';
import type { TableColumn } from '../types';

export const TABLE_COLUMNS: readonly TableColumn[] = [
  {
    id: TableColumnId.Name,
    label: 'Unit',
    tooltip: 'Department or team name',
    minWidth: 120,
    defaultWidth: 220,
    nonNumeric: true,
  },
  {
    id: TableColumnId.Level,
    label: 'Level',
    tooltip: 'Hierarchy depth in the org structure',
    minWidth: 72,
    defaultWidth: 96,
  },
  {
    id: TableColumnId.Headcount,
    label: 'Total employees',
    tooltip: 'Aggregated headcount',
    minWidth: 120,
    defaultWidth: 160,
  },
  {
    id: TableColumnId.Budget,
    label: 'Total budget',
    tooltip: 'Aggregated budget',
    minWidth: 120,
    defaultWidth: 160,
  },
  {
    id: TableColumnId.Performance,
    label: 'Avg. performance',
    tooltip: 'Average performance (0–100)',
    minWidth: 140,
    defaultWidth: 180,
  },
] as const;
