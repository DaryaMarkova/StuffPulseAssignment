import { ERROR_MESSAGES } from '@/constants/messages.js';
import { aggregatesService } from '@/services/aggregate.service.js';
import type { Node, SeedLeaf } from '@/types/index.js';



/**
 * Seed-дерево компании: root → divisions → departments → teams (4 уровня, 45 узлов).
 * Метрики листьев задаются явно; агрегаты предков пересчитываются после сборки.
 */
export class Three {
  /**
   * Возвращает текущую метку времени в ISO.
   *
   * @returns {string} ISO-строка даты
   */
  private now(): string {
    return new Date().toISOString();
  }

  /**
   * Создаёт групповой узел с нулевыми метриками.
   *
   * @param {string} id - идентификатор узла
   * @param {string} name - отображаемое имя
   * @param {string | null} parentId - id родителя или null для корня
   * @returns {Node} групповой узел
   */
  private group(id: string, name: string, parentId: string | null): Node {
    return {
      id,
      name,
      parentId,
      ownHeadcount: 0,
      ownBudget: 0,
      ownPerformance: 0,
      headcount: 0,
      budget: 0,
      performance: 0,
      updatedAt: this.now(),
    };
  }

  /**
   * Создаёт листовой узел из seed-данных.
   *
   * @param {SeedLeaf} data - метрики и идентификаторы листа
   * @returns {Node} листовой узел
   */
  private leaf(data: SeedLeaf): Node {
    return {
      ...data,
      ownHeadcount: data.headcount,
      ownBudget: data.budget,
      ownPerformance: data.performance,
      updatedAt: this.now(),
    };
  }

  /**
   * Собирает seed-дерево и пересчитывает агрегаты предков.
   *
   * @returns {Node[]} плоский список узлов (≥ 40)
   */
  initNodes(): Node[] {
    const nodes: Node[] = [
      this.group('root', 'StuffPulse Corp', null),

      this.group('div-eng', 'Engineering', 'root'),
      this.group('div-prod', 'Product', 'root'),
      this.group('div-ops', 'Operations', 'root'),
      this.group('div-go', 'Go-To-Market', 'root'),

      this.group('dep-plat', 'Platform', 'div-eng'),
      this.group('dep-app', 'Applications', 'div-eng'),
      this.group('dep-qa', 'Quality', 'div-eng'),
      this.group('dep-des', 'Design', 'div-prod'),
      this.group('dep-pm', 'Product Management', 'div-prod'),
      this.group('dep-data', 'Data', 'div-prod'),
      this.group('dep-fin', 'Finance', 'div-ops'),
      this.group('dep-hr', 'People', 'div-ops'),
      this.group('dep-it', 'IT Support', 'div-ops'),
      this.group('dep-sales', 'Sales', 'div-go'),
      this.group('dep-mkt', 'Marketing', 'div-go'),
      this.group('dep-cs', 'Customer Success', 'div-go'),

      this.leaf({
        id: 't-plat-core',
        name: 'Core Services',
        parentId: 'dep-plat',
        headcount: 12,
        budget: 420_000,
        performance: 88,
      }),
      this.leaf({
        id: 't-plat-infra',
        name: 'Infrastructure',
        parentId: 'dep-plat',
        headcount: 9,
        budget: 510_000,
        performance: 81,
      }),
      this.leaf({
        id: 't-plat-sec',
        name: 'Security',
        parentId: 'dep-plat',
        headcount: 6,
        budget: 280_000,
        performance: 92,
      }),
      this.leaf({
        id: 't-app-web',
        name: 'Web Client',
        parentId: 'dep-app',
        headcount: 14,
        budget: 390_000,
        performance: 76,
      }),
      this.leaf({
        id: 't-app-mobile',
        name: 'Mobile',
        parentId: 'dep-app',
        headcount: 11,
        budget: 360_000,
        performance: 84,
      }),
      this.leaf({
        id: 't-app-api',
        name: 'Public API',
        parentId: 'dep-app',
        headcount: 8,
        budget: 310_000,
        performance: 79,
      }),
      this.leaf({
        id: 't-qa-auto',
        name: 'Automation',
        parentId: 'dep-qa',
        headcount: 7,
        budget: 190_000,
        performance: 87,
      }),
      this.leaf({
        id: 't-qa-manual',
        name: 'Manual QA',
        parentId: 'dep-qa',
        headcount: 5,
        budget: 140_000,
        performance: 73,
      }),
      this.leaf({
        id: 't-des-ux',
        name: 'UX Research',
        parentId: 'dep-des',
        headcount: 4,
        budget: 160_000,
        performance: 90,
      }),
      this.leaf({
        id: 't-des-ui',
        name: 'UI Design',
        parentId: 'dep-des',
        headcount: 6,
        budget: 200_000,
        performance: 85,
      }),
      this.leaf({
        id: 't-pm-core',
        name: 'Core Product',
        parentId: 'dep-pm',
        headcount: 5,
        budget: 220_000,
        performance: 82,
      }),
      this.leaf({
        id: 't-pm-growth',
        name: 'Growth',
        parentId: 'dep-pm',
        headcount: 4,
        budget: 180_000,
        performance: 78,
      }),
      this.leaf({
        id: 't-data-eng',
        name: 'Data Engineering',
        parentId: 'dep-data',
        headcount: 8,
        budget: 340_000,
        performance: 86,
      }),
      this.leaf({
        id: 't-data-sci',
        name: 'Data Science',
        parentId: 'dep-data',
        headcount: 6,
        budget: 300_000,
        performance: 80,
      }),
      this.leaf({
        id: 't-fin-acc',
        name: 'Accounting',
        parentId: 'dep-fin',
        headcount: 5,
        budget: 150_000,
        performance: 91,
      }),
      this.leaf({
        id: 't-fin-fp',
        name: 'FP&A',
        parentId: 'dep-fin',
        headcount: 4,
        budget: 170_000,
        performance: 88,
      }),
      this.leaf({
        id: 't-hr-recr',
        name: 'Recruiting',
        parentId: 'dep-hr',
        headcount: 6,
        budget: 160_000,
        performance: 74,
      }),
      this.leaf({
        id: 't-hr-ops',
        name: 'HR Ops',
        parentId: 'dep-hr',
        headcount: 3,
        budget: 110_000,
        performance: 83,
      }),
      this.leaf({
        id: 't-it-desk',
        name: 'Help Desk',
        parentId: 'dep-it',
        headcount: 7,
        budget: 130_000,
        performance: 77,
      }),
      this.leaf({
        id: 't-it-net',
        name: 'Networking',
        parentId: 'dep-it',
        headcount: 4,
        budget: 190_000,
        performance: 89,
      }),
      this.leaf({
        id: 't-sales-ent',
        name: 'Enterprise',
        parentId: 'dep-sales',
        headcount: 10,
        budget: 450_000,
        performance: 71,
      }),
      this.leaf({
        id: 't-sales-smb',
        name: 'SMB',
        parentId: 'dep-sales',
        headcount: 9,
        budget: 280_000,
        performance: 75,
      }),
      this.leaf({
        id: 't-mkt-brand',
        name: 'Brand',
        parentId: 'dep-mkt',
        headcount: 5,
        budget: 210_000,
        performance: 84,
      }),
      this.leaf({
        id: 't-mkt-dem',
        name: 'Demand Gen',
        parentId: 'dep-mkt',
        headcount: 7,
        budget: 260_000,
        performance: 69,
      }),
      this.leaf({
        id: 't-cs-onb',
        name: 'Onboarding',
        parentId: 'dep-cs',
        headcount: 6,
        budget: 170_000,
        performance: 88,
      }),
      this.leaf({
        id: 't-cs-sup',
        name: 'Support',
        parentId: 'dep-cs',
        headcount: 12,
        budget: 240_000,
        performance: 72,
      }),
      this.leaf({
        id: 't-cs-succ',
        name: 'Success Managers',
        parentId: 'dep-cs',
        headcount: 8,
        budget: 290_000,
        performance: 81,
      }),
    ];

    if (nodes.length < 40) {
      throw new Error(ERROR_MESSAGES.seedTooSmall(nodes.length));
    }

    const byId = new Map(nodes.map((node) => [node.id, node]));
    const children = new Map<string | null, string[]>();

    for (const node of nodes) {
      const list = children.get(node.parentId) ?? [];

      list.push(node.id);
      children.set(node.parentId, list);
    }

    const leaves = nodes.filter((node) => !children.get(node.id)?.length);

    for (const leafNode of leaves) {
      aggregatesService.recomputeAncestors(byId, children, leafNode.id);
    }

    return [...byId.values()];
  }
}

/**
 * Создаёт начальный набор узлов орг-дерева.
 *
 * @returns {Node[]} плоский список seed-узлов
 */
export function createSeedNodes(): Node[] {
  return new Three().initNodes();
}
