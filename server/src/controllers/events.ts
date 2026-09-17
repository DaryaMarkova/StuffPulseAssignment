import { Router, type Request, type Response } from 'express';
import { SSE } from '@/constants/messages.js';
import { realtimeService } from '@/services/realtime.service.js';

/**
 * HTTP-обработчики для SSE `/api/events`.
 */
class EventsController {
  readonly router = Router();

  /**
   * Регистрирует маршруты контроллера.
   */
  constructor() {
    this.router.get('/', this.subscribe);
  }

  /**
   * GET `/` — подписка на поток патчей (SSE).
   *
   * @param {Request} req - Express-запрос
   * @param {Response} res - Express-ответ SSE-потока
   * @returns {void}
   */
  private subscribe = (req: Request, res: Response): void => {
    res.setHeader('Content-Type', SSE.CONTENT_TYPE);
    res.setHeader('Cache-Control', SSE.CACHE_CONTROL);
    res.setHeader('Connection', SSE.CONNECTION);
    res.flushHeaders?.();

    res.write(SSE.readyMessage());

    const clientId = realtimeService.addClient(res);

    const heartbeat = setInterval(() => {
      res.write(SSE.HEARTBEAT);
    }, 15_000);
    heartbeat.unref?.();

    req.on('close', () => {
      clearInterval(heartbeat);
      realtimeService.removeClient(clientId);
    });
  };
}

export const eventsRouter = new EventsController().router;
