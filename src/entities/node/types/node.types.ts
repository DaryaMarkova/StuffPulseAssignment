import { z } from 'zod';
import {
  nodeSchema,
  nodesResponseSchema,
  patchEventSchema,
} from '../model/node.schema';

export type Node = z.infer<typeof nodeSchema>;
export type NodesResponse = z.infer<typeof nodesResponseSchema>;
export type PatchEvent = z.infer<typeof patchEventSchema>;
export type NodesDataSource = 'api' | 'static';
export type NodesLoadResult = {
  data: NodesResponse;
  source: NodesDataSource;
};
