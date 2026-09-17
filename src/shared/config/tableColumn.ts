export const TableColumnId = {
  Name: 'name',
  Level: 'level',
  Headcount: 'headcount',
  Budget: 'budget',
  Performance: 'performance',
} as const;

export type TableColumnId =
  (typeof TableColumnId)[keyof typeof TableColumnId];
