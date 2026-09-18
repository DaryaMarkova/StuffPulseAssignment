export const DASHBOARD_IDS = {
  loading: 'dashboard-loading',
  error: 'dashboard-error',
  empty: 'dashboard-empty',
  filter: 'dashboard-filter',
  filterIcon: 'dashboard-filter-icon',
} as const;

/** Debounce for real-time name filter. */
export const FILTER_DEBOUNCE_MS = 250;

export const DASHBOARD_MESSAGES = {
  loading: 'Loading organization…',
  loadingTooltip: 'Loading organization data',
  loadFailed: 'Failed to load nodes',
  empty: 'No nodes returned.',
  emptyTooltip: 'The server returned an empty organization',
  filterLabel: 'AI search',
  filterPlaceholder: 'Try “performance above 70” or a unit name…',
  filterTooltip:
    'Natural language → structured filter on the client; plain text falls back to name search',
  filterEmpty: 'No units match the filter.',
  filterModeAi: 'AI filter',
  filterModeText: 'Text search',
} as const;
