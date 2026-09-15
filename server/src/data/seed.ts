import type { OrgNode } from '../types.js'
import { recomputeAncestors } from '../aggregates.js'

type SeedLeaf = {
  id: string
  name: string
  parentId: string
  headcount: number
  budget: number
  performance: number
}

const now = () => new Date().toISOString()

function group(
  id: string,
  name: string,
  parentId: string | null,
): OrgNode {
  return {
    id,
    name,
    parentId,
    headcount: 0,
    budget: 0,
    performance: 0,
    updatedAt: now(),
  }
}

function leaf(data: SeedLeaf): OrgNode {
  return {
    ...data,
    updatedAt: now(),
  }
}

/**
 * Company tree: root → divisions → departments → teams (4 levels, 45 nodes).
 * Leaf metrics are set explicitly; ancestor aggregates are recomputed after seed.
 */
export function createSeedNodes(): OrgNode[] {
  const nodes: OrgNode[] = [
    group('root', 'StuffPulse Corp', null),

    group('div-eng', 'Engineering', 'root'),
    group('div-prod', 'Product', 'root'),
    group('div-ops', 'Operations', 'root'),
    group('div-go', 'Go-To-Market', 'root'),

    group('dep-plat', 'Platform', 'div-eng'),
    group('dep-app', 'Applications', 'div-eng'),
    group('dep-qa', 'Quality', 'div-eng'),
    group('dep-des', 'Design', 'div-prod'),
    group('dep-pm', 'Product Management', 'div-prod'),
    group('dep-data', 'Data', 'div-prod'),
    group('dep-fin', 'Finance', 'div-ops'),
    group('dep-hr', 'People', 'div-ops'),
    group('dep-it', 'IT Support', 'div-ops'),
    group('dep-sales', 'Sales', 'div-go'),
    group('dep-mkt', 'Marketing', 'div-go'),
    group('dep-cs', 'Customer Success', 'div-go'),

    leaf({ id: 't-plat-core', name: 'Core Services', parentId: 'dep-plat', headcount: 12, budget: 420_000, performance: 88 }),
    leaf({ id: 't-plat-infra', name: 'Infrastructure', parentId: 'dep-plat', headcount: 9, budget: 510_000, performance: 81 }),
    leaf({ id: 't-plat-sec', name: 'Security', parentId: 'dep-plat', headcount: 6, budget: 280_000, performance: 92 }),
    leaf({ id: 't-app-web', name: 'Web Client', parentId: 'dep-app', headcount: 14, budget: 390_000, performance: 76 }),
    leaf({ id: 't-app-mobile', name: 'Mobile', parentId: 'dep-app', headcount: 11, budget: 360_000, performance: 84 }),
    leaf({ id: 't-app-api', name: 'Public API', parentId: 'dep-app', headcount: 8, budget: 310_000, performance: 79 }),
    leaf({ id: 't-qa-auto', name: 'Automation', parentId: 'dep-qa', headcount: 7, budget: 190_000, performance: 87 }),
    leaf({ id: 't-qa-manual', name: 'Manual QA', parentId: 'dep-qa', headcount: 5, budget: 140_000, performance: 73 }),
    leaf({ id: 't-des-ux', name: 'UX Research', parentId: 'dep-des', headcount: 4, budget: 160_000, performance: 90 }),
    leaf({ id: 't-des-ui', name: 'UI Design', parentId: 'dep-des', headcount: 6, budget: 200_000, performance: 85 }),
    leaf({ id: 't-pm-core', name: 'Core Product', parentId: 'dep-pm', headcount: 5, budget: 220_000, performance: 82 }),
    leaf({ id: 't-pm-growth', name: 'Growth', parentId: 'dep-pm', headcount: 4, budget: 180_000, performance: 78 }),
    leaf({ id: 't-data-eng', name: 'Data Engineering', parentId: 'dep-data', headcount: 8, budget: 340_000, performance: 86 }),
    leaf({ id: 't-data-sci', name: 'Data Science', parentId: 'dep-data', headcount: 6, budget: 300_000, performance: 80 }),
    leaf({ id: 't-fin-acc', name: 'Accounting', parentId: 'dep-fin', headcount: 5, budget: 150_000, performance: 91 }),
    leaf({ id: 't-fin-fp', name: 'FP&A', parentId: 'dep-fin', headcount: 4, budget: 170_000, performance: 88 }),
    leaf({ id: 't-hr-recr', name: 'Recruiting', parentId: 'dep-hr', headcount: 6, budget: 160_000, performance: 74 }),
    leaf({ id: 't-hr-ops', name: 'HR Ops', parentId: 'dep-hr', headcount: 3, budget: 110_000, performance: 83 }),
    leaf({ id: 't-it-desk', name: 'Help Desk', parentId: 'dep-it', headcount: 7, budget: 130_000, performance: 77 }),
    leaf({ id: 't-it-net', name: 'Networking', parentId: 'dep-it', headcount: 4, budget: 190_000, performance: 89 }),
    leaf({ id: 't-sales-ent', name: 'Enterprise', parentId: 'dep-sales', headcount: 10, budget: 450_000, performance: 71 }),
    leaf({ id: 't-sales-smb', name: 'SMB', parentId: 'dep-sales', headcount: 9, budget: 280_000, performance: 75 }),
    leaf({ id: 't-mkt-brand', name: 'Brand', parentId: 'dep-mkt', headcount: 5, budget: 210_000, performance: 84 }),
    leaf({ id: 't-mkt-dem', name: 'Demand Gen', parentId: 'dep-mkt', headcount: 7, budget: 260_000, performance: 69 }),
    leaf({ id: 't-cs-onb', name: 'Onboarding', parentId: 'dep-cs', headcount: 6, budget: 170_000, performance: 88 }),
    leaf({ id: 't-cs-sup', name: 'Support', parentId: 'dep-cs', headcount: 12, budget: 240_000, performance: 72 }),
    leaf({ id: 't-cs-succ', name: 'Success Managers', parentId: 'dep-cs', headcount: 8, budget: 290_000, performance: 81 }),
  ]

  if (nodes.length < 40) {
    throw new Error(`Seed must contain at least 40 nodes, got ${nodes.length}`)
  }

  const byId = new Map(nodes.map((node) => [node.id, node]))
  const children = new Map<string | null, string[]>()
  for (const node of nodes) {
    const list = children.get(node.parentId) ?? []
    list.push(node.id)
    children.set(node.parentId, list)
  }

  const leaves = nodes.filter((node) => !(children.get(node.id)?.length))
  for (const leafNode of leaves) {
    recomputeAncestors(byId, children, leafNode.id)
  }

  return [...byId.values()]
}
