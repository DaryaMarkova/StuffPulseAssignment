import type { ConnectionStatus } from '@/shared/types';
import type { PatchEvent } from '@/entities/node/types';

/**
 * Обработчики событий SSE-клиента.
 */
export type EventsHandlers = {
  /** Вызывается при смене статуса соединения. */
  onStatus: (status: ConnectionStatus) => void;
  /** Вызывается при валидном событии `patch`. */
  onPatch: (patch: PatchEvent) => void;
  /** Вызывается при ошибке разбора или обработки патча. */
  onError?: (error: Error) => void;
};
