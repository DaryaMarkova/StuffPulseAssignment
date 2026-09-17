export type Node = {
  id: string;
  name: string;
  parentId: string | null;
  /** Own metrics of the node (not including descendants). */
  ownHeadcount: number;
  ownBudget: number;
  ownPerformance: number;
  /** Aggregated: own + all descendants; performance weighted by headcount. */
  headcount: number;
  budget: number;
  performance: number;
  updatedAt: string;
};

export type NodesResponse = {
  nodes: Node[];
};

export type PatchEvent = {
  nodes: Node[];
};
