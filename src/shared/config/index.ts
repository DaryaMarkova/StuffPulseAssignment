export const API_BASE = '/api';

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

export type { ConnectionStatus } from '@/shared/types';
