export const TABLE_PANEL_ID = 'analytics-table-panel';
export const TABLE_EMPTY_ID = 'analytics-table-empty';

export const TABLE_MESSAGES = {
  ariaLabel: 'Analytics table',
  panelTooltip: 'Analytics table — scoped to the selected tree node',
  empty: 'No nodes in scope.',
  emptyTooltip: 'No nodes match the current selection',
  sortHint: 'Click to sort ascending, double-click to reverse',
} as const;

/**
 * Подпись для resize-кнопки колонки.
 *
 * @param {string} label - название колонки
 * @returns {string} aria-label
 */
export function resizeColumnLabel(label: string): string {
  return `Resize ${label} column`;
}

/**
 * Подпись для ручки перестановки колонки.
 *
 * @param {string} label - название колонки
 * @returns {string} aria-label
 */
export function reorderColumnLabel(label: string): string {
  return `Reorder ${label} column`;
}
