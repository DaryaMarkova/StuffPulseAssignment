import { z } from 'zod';

export const nodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().nullable(),
  headcount: z.number().nonnegative(),
  budget: z.number().nonnegative(),
  performance: z.number().min(0).max(100),
  updatedAt: z.iso.datetime(),
});

export const nodesResponseSchema = z.object({
  nodes: z.array(nodeSchema),
});

export const patchEventSchema = z.object({
  nodes: z.array(nodeSchema).min(1),
});
