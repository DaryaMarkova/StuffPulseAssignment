export type OrgNode = {
  id: string
  name: string
  parentId: string | null
  headcount: number
  budget: number
  performance: number
  updatedAt: string
}

export type NodesResponse = {
  nodes: OrgNode[]
}

export type PatchEvent = {
  nodes: OrgNode[]
}
