import type { ConnectionStatus } from '@/shared/types';

export type AppHeaderProps = {
  /** Статус SSE для бейджа. */
  status: ConnectionStatus;
};
