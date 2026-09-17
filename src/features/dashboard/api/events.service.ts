import {
  API_BASE,
  API_ERROR_MESSAGES,
  ConnectionStatus,
  SseEvent,
  SSE_BACKOFF,
} from '@/shared/config';

import { patchEventSchema } from '@/entities/node';
import type { EventsHandlers } from '../types';

/**
 * SSE-клиент для `/api/events` с ручным переподключением
 * и экспоненциальным backoff.
 */
export class EventsService {
  private source: EventSource | null = null;
  private handlers: EventsHandlers | null = null;
  private attempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  /**
   * Запускает подписку на SSE и сбрасывает состояние переподключения.
   *
   * @param {EventsHandlers} handlers - колбэки статуса, патчей и ошибок
   * @returns {void}
   */
  start(handlers: EventsHandlers): void {
    this.handlers = handlers;
    this.intentionalClose = false;
    this.attempt = 0;
    
    this.open();
  }

  /**
   * Останавливает SSE, отменяет переподключение и очищает обработчики.
   *
   * @returns {void}
   */
  stop(): void {
    this.intentionalClose = true;
    this.clearReconnectTimer();
    this.closeSource();

    this.handlers?.onStatus(ConnectionStatus.Disconnected);
    this.handlers = null;
  }

  /**
   * Открывает `EventSource` и подключает обработчики ready / patch / error.
   *
   * @returns {void}
   */
  private open(): void {
    this.clearReconnectTimer();
    this.closeSource();

    if (!this.handlers) {
      return;
    }

    this.handlers.onStatus(ConnectionStatus.Connecting);

    const source = new EventSource(`${API_BASE}/events`);
    this.source = source;

    source.addEventListener(SseEvent.Ready, () => {
      this.attempt = 0;
      this.handlers?.onStatus(ConnectionStatus.Connected);
    });

    source.addEventListener(SseEvent.Patch, (event: MessageEvent<string>) => {
      try {
        const raw: unknown = JSON.parse(event.data);
        const parsed = patchEventSchema.safeParse(raw);

        if (!parsed.success) {
          throw new Error(
            API_ERROR_MESSAGES.invalidPatchEvent(parsed.error.message),
          );
        }

        this.handlers?.onPatch(parsed.data);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.handlers?.onError?.(err);
      }
    });

    source.onerror = () => {

      if (this.intentionalClose) {
        return;
      }

      this.closeSource();
      this.handlers?.onStatus(ConnectionStatus.Disconnected);
      this.scheduleReconnect();
    };
  }

  /**
   * Планирует следующую попытку переподключения с экспоненциальной задержкой.
   *
   * @returns {void}
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimer();

    const delay = Math.min(
      SSE_BACKOFF.maxMs,
      SSE_BACKOFF.initialMs * SSE_BACKOFF.factor ** this.attempt,
    );
    this.attempt += 1;

    this.reconnectTimer = setTimeout(() => {
      this.open();
    }, delay);
  }

  /**
   * Закрывает активный `EventSource`, если он открыт.
   *
   * @returns {void}
   */
  private closeSource(): void {

    if (!this.source) {
      return;
    }

    this.source.close();
    this.source = null;
  }

  /**
   * Сбрасывает таймер ожидающего переподключения, если он задан.
   *
   * @returns {void}
   */
  private clearReconnectTimer(): void {

    if (!this.reconnectTimer) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}

export const eventsService = new EventsService();
