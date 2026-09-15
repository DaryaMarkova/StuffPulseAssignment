import type { Response } from 'express';
import { SSE } from '@/constants/messages.js';
import { store } from '@/store.js';
import type { Node, PatchEvent, SseClient } from '@/types/index.js';


/** SSE-подписки, broadcast патчей и фоновые мутации листьев. */
export class RealtimeService {
  private clients = new Map<number, SseClient>();
  private nextClientId = 1;
  private mutationTimer: ReturnType<typeof setInterval> | null = null;

  addClient(res: Response): number {
    const id = this.nextClientId++;

    this.clients.set(id, { id, res });

    return id;
  }

  removeClient(id: number): void {
    this.clients.delete(id);
  }

  broadcastPatch(nodes: Node[]): void {
    if (nodes.length === 0 || this.clients.size === 0) {
      return;
    }

    const payload: PatchEvent = { nodes };
    const data = SSE.patchMessage(payload);

    for (const client of this.clients.values()) {
      client.res.write(data);
    }
  }

  startMutations(intervalMs = 4_000): void {
    if (this.mutationTimer) {
      return;
    }

    this.mutationTimer = setInterval(() => this.mutateRandomLeaf(), intervalMs);
    this.mutationTimer.unref?.();
  }

  stopMutations(): void {
    if (!this.mutationTimer) {
      return;
    }

    clearInterval(this.mutationTimer);
    this.mutationTimer = null;
  }

  private mutateRandomLeaf(): void {
    const leafIds = store.getLeafIds();
    if (leafIds.length === 0) {
      return;
    }

    const id = leafIds[Math.floor(Math.random() * leafIds.length)]!;
    
    const node = store.getById(id);
    
    if (!node) {
      return;
    }

    const performanceDelta = Math.floor(Math.random() * 11) - 5;
    const headcountDelta = Math.floor(Math.random() * 3) - 1;
    const budgetDelta = (Math.floor(Math.random() * 5) - 2) * 5_000;

    const patched = store.applyLeafPatch(id, {
      performance: Math.max(
        0,
        Math.min(100, node.performance + performanceDelta),
      ),
      headcount: Math.max(1, node.headcount + headcountDelta),
      budget: Math.max(10_000, node.budget + budgetDelta),
    });

    this.broadcastPatch(patched);
  }
}

export const realtimeService = new RealtimeService();
