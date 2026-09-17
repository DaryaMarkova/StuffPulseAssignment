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
  filterLabel: 'Filter by name',
  filterPlaceholder: 'Search units…',
  filterTooltip: 'Filter organization by name (250ms debounce)',
  filterEmpty: 'No units match the filter.',
} as const;
