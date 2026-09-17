import type { ConnectionStatus } from './connection.types';

export type ConnectionBadgeProps = {
  /** Текущий статус SSE-соединения. */
  status: ConnectionStatus;
};
