export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

/** Prefer static seed JSON (GitHub Pages / offline). */
export const PREFER_STATIC_NODES =
  import.meta.env.VITE_USE_STATIC_DATA === 'true';

/** Bundled snapshot from `public/data/nodes.json` (respects Vite `base`). */
export const STATIC_NODES_URL = `${import.meta.env.BASE_URL}data/nodes.json`;

export const NODES_QUERY_KEY = ['nodes'] as const;

/** React Query staleTime — 5s per requirements. */
export const NODES_STALE_TIME_MS = 5_000;

/** Highlight duration for patched cells. */
export const CELL_FADE_OUT_MS = 1_500;

export const SSE_BACKOFF = {
  initialMs: 1_000,
  maxMs: 30_000,
  factor: 2,
} as const;

export * from './keyboard';
export * from './connection';
export * from './performance';
export * from './tableColumn';
export * from './apiMessages';
