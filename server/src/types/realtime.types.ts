import type { Response } from 'express';

export type SseClient = {
  id: number;
  res: Response;
};
