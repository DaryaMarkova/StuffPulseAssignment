import { buildChildrenIndex, recomputeAncestors } from './aggregates.js'
import { createSeedNodes } from './data/seed.js'
import type { OrgNode } from './types.js'

type LeafPatch = Partial<
  Pick<OrgNode, 'headcount' | 'budget' | 'performance' | 'name'>
>

class NodeStore {
  private byId: Map<string, OrgNode>
  private children: Map<string | null, string[]>

  constructor(nodes: OrgNode[]) {
    this.byId = new Map(nodes.map((node) => [node.id, node]))
    this.children = buildChildrenIndex(nodes)
  }

  getAll(): OrgNode[] {
    return [...this.byId.values()]
  }

  getById(id: string): OrgNode | undefined {
    return this.byId.get(id)
  }

  getLeafIds(): string[] {
    return this.getAll()
      .filter((node) => !(this.children.get(node.id)?.length))
      .map((node) => node.id)
  }

  /**
   * Apply a leaf metric patch and recompute only the node + ancestors.
   */
  applyLeafPatch(id: string, patch: LeafPatch): OrgNode[] {
    const node = this.byId.get(id)
    if (!node) {
      throw new Error(`Node not found: ${id}`)
    }

    const childIds = this.children.get(id) ?? []
    if (childIds.length > 0) {
      throw new Error(`Only leaf nodes can be patched directly: ${id}`)
    }

    const next: OrgNode = {
      ...node,
      ...patch,
      performance:
        patch.performance === undefined
          ? node.performance
          : Math.max(0, Math.min(100, patch.performance)),
      updatedAt: new Date().toISOString(),
    }
    this.byId.set(id, next)

    return recomputeAncestors(this.byId, this.children, id)
  }
}

export const store = new NodeStore(createSeedNodes())
