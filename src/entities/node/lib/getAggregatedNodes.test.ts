import { describe, expect, it } from 'vitest';
import type { Node } from '../types';
import { getAggregatedNodes } from './getAggregatedNodes';

/**
 * @param {Partial<Node> & Pick<Node, 'id' | 'name' | 'parentId'>} partial - поля узла
 * @returns {Node} тестовый узел
 */
function node(
  partial: Partial<Node> & Pick<Node, 'id' | 'name' | 'parentId'>,
): Node {
  return {
    ownHeadcount: 0,
    ownBudget: 0,
    ownPerformance: 0,
    headcount: 0,
    budget: 0,
    performance: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('getAggregatedNodes', () => {
  it('returns empty list unchanged', () => {
    expect(getAggregatedNodes([])).toEqual([]);
  });

  it('copies own metrics to aggregates for a leaf', () => {
    const leaf = node({
      id: 'leaf',
      name: 'Leaf',
      parentId: null,
      ownHeadcount: 10,
      ownBudget: 50_000,
      ownPerformance: 80,
    });

    const [result] = getAggregatedNodes([leaf]);

    expect(result).toMatchObject({
      id: 'leaf',
      headcount: 10,
      budget: 50_000,
      performance: 80,
    });
  });

  it('sums headcount and budget: own + descendants', () => {
    const nodes = [
      node({
        id: 'root',
        name: 'Root',
        parentId: null,
        ownHeadcount: 2,
        ownBudget: 10_000,
        ownPerformance: 50,
      }),
      
      node({
        id: 'a',
        name: 'A',
        parentId: 'root',
        ownHeadcount: 4,
        ownBudget: 20_000,
        ownPerformance: 100,
      }),

      node({
        id: 'b',
        name: 'B',
        parentId: 'root',
        ownHeadcount: 6,
        ownBudget: 30_000,
        ownPerformance: 50,
      }),
    ];

    const byId = new Map(getAggregatedNodes(nodes).map((n) => [n.id, n]));

    expect(byId.get('a')).toMatchObject({
      headcount: 4,
      budget: 20_000,
      performance: 100,
    });
    
    expect(byId.get('b')).toMatchObject({
      headcount: 6,
      budget: 30_000,
      performance: 50,
    });

    expect(byId.get('root')).toMatchObject({
      headcount: 2 + 4 + 6,
      budget: 10_000 + 20_000 + 30_000,
    });
  });

  it('computes headcount-weighted performance for parents', () => {
    // root own: 2 @ 50; child a: 4 @ 100; child b: 6 @ 50
    // weighted = 2*50 + 4*100 + 6*50 = 100 + 400 + 300 = 800
    // headcount = 12 → performance = round(800/12) = round(66.666) = 67
    const nodes = [
      node({
        id: 'root',
        name: 'Root',
        parentId: null,
        ownHeadcount: 2,
        ownBudget: 0,
        ownPerformance: 50,
      }),
      node({
        id: 'a',
        name: 'A',
        parentId: 'root',
        ownHeadcount: 4,
        ownBudget: 0,
        ownPerformance: 100,
      }),
      node({
        id: 'b',
        name: 'B',
        parentId: 'root',
        ownHeadcount: 6,
        ownBudget: 0,
        ownPerformance: 50,
      }),
    ];

    const root = getAggregatedNodes(nodes).find((n) => n.id === 'root');

    expect(root?.performance).toBe(67);
  });

  it('aggregates nested trees bottom-up', () => {
    const nodes = [
      node({
        id: 'company',
        name: 'Company',
        parentId: null,
        ownHeadcount: 1,
        ownBudget: 5_000,
        ownPerformance: 40,
      }),
      node({
        id: 'eng',
        name: 'Engineering',
        parentId: 'company',
        ownHeadcount: 1,
        ownBudget: 5_000,
        ownPerformance: 60,
      }),
      node({
        id: 'fe',
        name: 'Frontend',
        parentId: 'eng',
        ownHeadcount: 3,
        ownBudget: 15_000,
        ownPerformance: 90,
      }),
      node({
        id: 'be',
        name: 'Backend',
        parentId: 'eng',
        ownHeadcount: 5,
        ownBudget: 25_000,
        ownPerformance: 70,
      }),
    ];

    const byId = new Map(getAggregatedNodes(nodes).map((n) => [n.id, n]));

    expect(byId.get('fe')).toMatchObject({ headcount: 3, budget: 15_000 });
    expect(byId.get('be')).toMatchObject({ headcount: 5, budget: 25_000 });
    expect(byId.get('eng')).toMatchObject({
      headcount: 1 + 3 + 5,
      budget: 5_000 + 15_000 + 25_000,
    });
    expect(byId.get('company')).toMatchObject({
      headcount: 1 + 1 + 3 + 5,
      budget: 5_000 + 5_000 + 15_000 + 25_000,
    });

    // eng weighted = 1*60 + 3*90 + 5*70 = 60 + 270 + 350 = 680 / 9 ≈ 75.56 → 76
    expect(byId.get('eng')?.performance).toBe(76);
  });

  it('clamps aggregated performance to 0–100', () => {
    const nodes = [
      node({
        id: 'root',
        name: 'Root',
        parentId: null,
        ownHeadcount: 1,
        ownBudget: 0,
        ownPerformance: 100,
      }),
      node({
        id: 'child',
        name: 'Child',
        parentId: 'root',
        ownHeadcount: 1,
        ownBudget: 0,
        ownPerformance: 100,
      }),
    ];

    const root = getAggregatedNodes(nodes).find((n) => n.id === 'root');

    expect(root?.performance).toBeGreaterThanOrEqual(0);
    expect(root?.performance).toBeLessThanOrEqual(100);
  });

  it('does not mutate the input array items in place unexpectedly for aggregates', () => {
    const leaf = node({
      id: 'leaf',
      name: 'Leaf',
      parentId: null,
      ownHeadcount: 5,
      ownBudget: 1,
      ownPerformance: 10,
      headcount: 999,
      budget: 999,
      performance: 999,
    });
    
    const input = [leaf];
    const output = getAggregatedNodes(input);

    expect(output).not.toBe(input);
    expect(output[0]).not.toBe(leaf);
    expect(leaf.headcount).toBe(999);
    expect(output[0]?.headcount).toBe(5);
  });
});