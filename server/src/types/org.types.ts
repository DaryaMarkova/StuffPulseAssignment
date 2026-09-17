export type Node = {
  id: string;
  name: string;
  parentId: string | null;
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
