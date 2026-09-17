import type { Node } from '@/entities/node/types';

export type TreeNode = Node & {
  children: TreeNode[];
  depth: number;
};
