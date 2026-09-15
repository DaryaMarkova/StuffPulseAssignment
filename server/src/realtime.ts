import type { Response } from 'express'
import type { OrgNode, PatchEvent } from './types.js'
import { store } from './store.js'

type Client = {
  id: number
  res: Response
}

const clients = new Map<number, Client>()
let nextClientId = 1
let mutationTimer: ReturnType<typeof setInterval> | null = null

export function addSseClient(res: Response): number {
  const id = nextClientId++
  clients.set(id, { id, res })
  return id
}

export function removeSseClient(id: number): void {
  clients.delete(id)
}

export function broadcastPatch(nodes: OrgNode[]): void {
  if (nodes.length === 0 || clients.size === 0) return

  const payload: PatchEvent = { nodes }
  const data = `event: patch\ndata: ${JSON.stringify(payload)}\n\n`

  for (const client of clients.values()) {
    client.res.write(data)
  }
}

function mutateRandomLeaf(): void {
  const leafIds = store.getLeafIds()
  if (leafIds.length === 0) return

  const id = leafIds[Math.floor(Math.random() * leafIds.length)]!
  const node = store.getById(id)
  if (!node) return

  const performanceDelta = Math.floor(Math.random() * 11) - 5
  const headcountDelta = Math.floor(Math.random() * 3) - 1
  const budgetDelta = (Math.floor(Math.random() * 5) - 2) * 5_000

  const patched = store.applyLeafPatch(id, {
    performance: Math.max(0, Math.min(100, node.performance + performanceDelta)),
    headcount: Math.max(1, node.headcount + headcountDelta),
    budget: Math.max(10_000, node.budget + budgetDelta),
  })

  broadcastPatch(patched)
}

export function startRealtimeMutations(intervalMs = 4_000): void {
  if (mutationTimer) return
  mutationTimer = setInterval(mutateRandomLeaf, intervalMs)
  mutationTimer.unref?.()
}

export function stopRealtimeMutations(): void {
  if (!mutationTimer) return
  clearInterval(mutationTimer)
  mutationTimer = null
}
