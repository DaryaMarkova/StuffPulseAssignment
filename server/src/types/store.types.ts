import type { Node } from '@/types/org.types.js';


export type LeafPatch = Partial<
  Pick<Node, 'headcount' | 'budget' | 'performance' | 'name'>
>;
