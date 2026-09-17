export const SortDirection = {
  Asc: 'asc',
  Desc: 'desc',
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export const AriaSort = {
  Ascending: 'ascending',
  Descending: 'descending',
  None: 'none',
} as const;

export type AriaSort = (typeof AriaSort)[keyof typeof AriaSort];

export const SORT_MARK = {
  [SortDirection.Asc]: '▲',
  [SortDirection.Desc]: '▼',
} as const;

export const SORT_HINT_MARK = '⇅';

/** Delay before applying single-click ascending sort (lets dblclick cancel). */
export const SORT_CLICK_DELAY_MS = 250;

/** Pointer movement threshold before treating gesture as column reorder. */
export const COLUMN_REORDER_DRAG_THRESHOLD_PX = 4;
