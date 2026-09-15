import { Router, type Request, type Response } from 'express';
import { ERROR_MESSAGES } from '@/constants/messages.js';
import { store } from '@/store.js';


/** HTTP-обработчики для REST `/api/nodes`. */
class NodesController {
  readonly router = Router();

  constructor() {
    this.router.get('/', this.list);
    this.router.get('/:id', this.getById);
  }

  /** GET / — плоский список всех узлов. */
  private list = (_req: Request, res: Response): void => {
    res.json({ nodes: store.getAll() });
  };

  /** GET /:id — один узел или 404. */
  private getById = (req: Request, res: Response): void => {
    const node = store.getById(req.params.id as string);

    if (!node) {
      res.status(404).json({ error: ERROR_MESSAGES.NODE_NOT_FOUND });
      return;
    }

    res.json(node);
  };
}

export const nodesRouter = new NodesController().router;
