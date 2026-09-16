import type { TableColumn } from '../types';

export const TABLE_COLUMNS: readonly TableColumn[] = [
  {
    id: 'name',
    label: 'Name',
    tooltip: 'Department or team name',
    minWidth: 120,
    defaultWidth: 220,
    nonNumeric: true,
  },
  {
    id: 'headcount',
    label: 'Headcount',
    tooltip: 'Number of people in the node',
    minWidth: 88,
    defaultWidth: 120,
  },
  {
    id: 'budget',
    label: 'Budget',
    tooltip: 'Budget in USD',
    minWidth: 96,
    defaultWidth: 130,
  },
  {
    id: 'performance',
    label: 'Performance',
    tooltip: 'Performance score',
    minWidth: 120,
    defaultWidth: 160,
  },
  {
    id: 'updated',
    label: 'Updated',
    tooltip: 'Last update time',
    minWidth: 88,
    defaultWidth: 110,
  },
] as const;
