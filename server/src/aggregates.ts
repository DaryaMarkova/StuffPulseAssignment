import type { OrgNode } from './types.js'

type NodeMap = Map<string, OrgNode>
type ChildrenMap = Map<string | null, string[]>

function clampPerformance(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

/**
 * Recompute aggregates for the given node and all ancestors.
 * - headcount / budget: sum of children
 * - performance: headcount-weighted average of children (own value if leaf)
 * Returns the patched nodes (node + ancestors), leaf-first then up.
 */
export function recomputeAncestors(
  byId: NodeMap,
  children: ChildrenMap,
  startId: string,
): OrgNode[] {
  const patched: OrgNode[] = []
  let currentId: string | null = startId

  while (currentId) {
    const node = byId.get(currentId)
    if (!node) break

    const childIds = children.get(currentId) ?? []
    const updatedAt = new Date().toISOString()

    if (childIds.length === 0) {
      const next: OrgNode = { ...node, updatedAt }
      byId.set(currentId, next)
      patched.push(next)
    } else {
      let headcount = 0
      let budget = 0
      let weightedPerformance = 0

      for (const childId of childIds) {
        const child = byId.get(childId)
        if (!child) continue
        headcount += child.headcount
        budget += child.budget
        weightedPerformance += child.performance * child.headcount
      }

      const performance =
        headcount > 0
          ? clampPerformance(weightedPerformance / headcount)
          : node.performance

      const next: OrgNode = {
        ...node,
        headcount,
        budget,
        performance,
        updatedAt,
      }
      byId.set(currentId, next)
      patched.push(next)
    }

    currentId = node.parentId
  }

  return patched
}

export function buildChildrenIndex(nodes: Iterable<OrgNode>): ChildrenMap {
  const children: ChildrenMap = new Map()
  for (const node of nodes) {
    const list = children.get(node.parentId) ?? []
    list.push(node.id)
    children.set(node.parentId, list)
  }
  return children
}
