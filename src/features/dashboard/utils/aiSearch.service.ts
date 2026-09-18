import type { Node } from '@/entities/node';
import { PERFORMANCE_THRESHOLDS } from '@/shared/config';
import { getFilterNodesByName, keepMatchedWithAncestors } from '@/shared/lib';
import type {
  AiSearchResult,
  MetricCompareOp,
  MetricConstraint,
  StructuredNodeFilter,
} from '../types/aiSearch.types';

type MetricKey = 'performance' | 'headcount' | 'budget';

const METRIC_ALIASES: Record<MetricKey, RegExp> = {
  performance:
    /performance|perf|efficiency|эффективност\w*/i,
  headcount:
    /headcount|employees?|people|staff|сотрудник\w*|численност\w*|head\s*count/i,
  budget: /budget|бюджет\w*/i,
};

const OP_PATTERNS: Array<{ pattern: RegExp; op: MetricCompareOp }> = [
  {
    pattern: />=|≥|at\s+least|greater\s+than\s+or\s+equal(?:\s+to)?/i,
    op: 'gte',
  },
  {
    pattern: /<=|≤|at\s+most|no\s+more\s+than|less\s+than\s+or\s+equal(?:\s+to)?/i,
    op: 'lte',
  },
  {
    pattern: />|greater\s+than|more\s+than|above|over|higher\s+than|свыше|выше|больше/i,
    op: 'gt',
  },
  {
    pattern: /<|less\s+than|below|under|lower\s+than|ниже|меньше/i,
    op: 'lt',
  },
  {
    pattern: /==|=|equal(?:s|\s+to)?|равно/i,
    op: 'eq',
  },
];

/**
 * Клиентский NL → структурированный фильтр; иначе текстовый поиск по имени.
 */
export class AiSearchService {
  /**
   * Парсит естественный язык в структурированный фильтр.
   *
   * @param {string} query - строка поиска
   * @returns {StructuredNodeFilter | null} фильтр или `null` (нужен text fallback)
   */
  parse(query: string): StructuredNodeFilter | null {
    const trimmed = query.trim();

    if (!trimmed) {
      return null;
    }

    const filter: StructuredNodeFilter = {};
    let remainder = trimmed;

    remainder = this.applyLevelHints(remainder, filter);
    remainder = this.applyBetweenClauses(remainder, filter);
    remainder = this.applyCompareClauses(remainder, filter);

    const name = remainder
      .replace(
        /\b(and|or|with|where|show|me|units?|teams?|nodes?|find|фильтр|покажи|найди)\b/gi,
        ' ',
      )
      .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (name) {
      filter.nameIncludes = name;
    }

    const hasMetric =
      Boolean(filter.performance) ||
      Boolean(filter.headcount) ||
      Boolean(filter.budget);

    if (!hasMetric) {
      return null;
    }

    return filter;
  }

  /**
   * Применяет структурированный фильтр; сохраняет предков совпадений.
   *
   * @param {Node[]} nodes - исходные узлы
   * @param {StructuredNodeFilter} filter - разобранный фильтр
   * @returns {Node[]} результат
   */
  apply(nodes: Node[], filter: StructuredNodeFilter): Node[] {
    const matched = new Set<string>();

    for (const node of nodes) {
      if (this.matchesNode(node, filter)) {
        matched.add(node.id);
      }
    }

    return keepMatchedWithAncestors(nodes, matched);
  }

  /**
   * NL → structured на клиенте; иначе fallback — текстовый поиск.
   *
   * @param {Node[]} nodes - исходные узлы
   * @param {string} query - строка из поля поиска
   * @returns {AiSearchResult} узлы и режим
   */
  search(nodes: Node[], query: string): AiSearchResult {
    const trimmed = query.trim();

    if (!trimmed) {
      return { nodes, mode: 'none', filter: null };
    }

    const structured = this.parse(trimmed);

    if (structured) {
      return {
        nodes: this.apply(nodes, structured),
        mode: 'structured',
        filter: structured,
      };
    }

    return {
      nodes: getFilterNodesByName(nodes, trimmed),
      mode: 'text',
      filter: null,
    };
  }

  /**
   * @param {Node} node - узел
   * @param {StructuredNodeFilter} filter - фильтр
   * @returns {boolean} совпадение
   */
  private matchesNode(node: Node, filter: StructuredNodeFilter): boolean {
    if (
      filter.nameIncludes &&
      !node.name.toLowerCase().includes(filter.nameIncludes.toLowerCase())
    ) {
      return false;
    }

    if (
      filter.performance &&
      !this.matchesConstraint(node.performance, filter.performance)
    ) {
      return false;
    }

    if (
      filter.headcount &&
      !this.matchesConstraint(node.headcount, filter.headcount)
    ) {
      return false;
    }

    if (
      filter.budget &&
      !this.matchesConstraint(node.budget, filter.budget)
    ) {
      return false;
    }

    return true;
  }

  /**
   * @param {number} actual - значение
   * @param {MetricConstraint} constraint - ограничение (опционально с `max`)
   * @returns {boolean} ok
   */
  private matchesConstraint(
    actual: number,
    constraint: MetricConstraint,
  ): boolean {
    if (constraint.max !== undefined) {
      return actual >= constraint.value && actual <= constraint.max;
    }

    switch (constraint.op) {
      case 'gt':
        return actual > constraint.value;
      case 'gte':
        return actual >= constraint.value;
      case 'lt':
        return actual < constraint.value;
      case 'lte':
        return actual <= constraint.value;
      case 'eq':
        return actual === constraint.value;
      default:
        return false;
    }
  }

  /**
   * high / mid / low performance.
   *
   * @param {string} text - запрос
   * @param {StructuredNodeFilter} filter - накопитель
   * @returns {string} остаток
   */
  private applyLevelHints(
    text: string,
    filter: StructuredNodeFilter,
  ): string {
    let next = text;

    const high =
      /(?:high|strong|хорош\w*|высок\w*)\s+(?:performance|efficiency|эффективност\w*)|(?:performance|efficiency|эффективност\w*)\s+(?:is\s+)?(?:high|strong|высок\w*)/i;
    const low =
      /(?:low|weak|плох\w*|низк\w*)\s+(?:performance|efficiency|эффективност\w*)|(?:performance|efficiency|эффективност\w*)\s+(?:is\s+)?(?:low|weak|низк\w*)/i;
    const mid =
      /(?:mid|medium|average|средн\w*)\s+(?:performance|efficiency|эффективност\w*)|(?:performance|efficiency|эффективност\w*)\s+(?:is\s+)?(?:mid|medium|average|средн\w*)/i;

    if (high.test(next)) {
      filter.performance = {
        op: 'gt',
        value: PERFORMANCE_THRESHOLDS.midMax,
      };
      next = next.replace(high, ' ');
    } else if (low.test(next)) {
      filter.performance = {
        op: 'lte',
        value: PERFORMANCE_THRESHOLDS.lowMax,
      };
      next = next.replace(low, ' ');
    } else if (mid.test(next)) {
      filter.performance = {
        op: 'gte',
        value: PERFORMANCE_THRESHOLDS.lowMax + 1,
        max: PERFORMANCE_THRESHOLDS.midMax,
      };
      next = next.replace(mid, ' ');
    }

    return this.normalizeSpaces(next);
  }

  /**
   * `metric between A and B`.
   *
   * @param {string} text - запрос
   * @param {StructuredNodeFilter} filter - накопитель
   * @returns {string} остаток
   */
  private applyBetweenClauses(
    text: string,
    filter: StructuredNodeFilter,
  ): string {
    let next = text;

    for (const metric of Object.keys(METRIC_ALIASES) as MetricKey[]) {
      if (filter[metric]) {
        continue;
      }

      const alias = METRIC_ALIASES[metric].source;
      const pattern = new RegExp(
        `(?:${alias})\\s*(?:is\\s+)?(?:between|от)\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:and|to|и|до)\\s*(\\d+(?:[.,]\\d+)?)`,
        'i',
      );
      const match = next.match(pattern);

      if (!match) {
        continue;
      }

      const a = this.parseNumber(match[1] ?? '');
      const b = this.parseNumber(match[2] ?? '');

      if (a === null || b === null) {
        continue;
      }

      filter[metric] = {
        op: 'gte',
        value: Math.min(a, b),
        max: Math.max(a, b),
      };
      next = next.replace(match[0], ' ');
    }

    return this.normalizeSpaces(next);
  }

  /**
   * `metric > 70`, `> 70 performance`, `performance: 70`.
   *
   * @param {string} text - запрос
   * @param {StructuredNodeFilter} filter - накопитель
   * @returns {string} остаток
   */
  private applyCompareClauses(
    text: string,
    filter: StructuredNodeFilter,
  ): string {
    let next = text;
    const opGroup = OP_PATTERNS.map((item) => item.pattern.source).join('|');

    for (const metric of Object.keys(METRIC_ALIASES) as MetricKey[]) {
      if (filter[metric]) {
        continue;
      }

      const alias = METRIC_ALIASES[metric].source;
      const patterns: Array<{
        regex: RegExp;
        read: (match: RegExpMatchArray) => MetricConstraint | null;
      }> = [
        {
          regex: new RegExp(
            `(?:${alias})\\s*(?:is\\s+)?(${opGroup})\\s*(\\d+(?:[.,]\\d+)?)`,
            'i',
          ),
          read: (match) => {
            const op = this.resolveOp(match[1] ?? '');
            const value = this.parseNumber(match[2] ?? '');

            return op && value !== null ? { op, value } : null;
          },
        },
        {
          regex: new RegExp(
            `(${opGroup})\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:${alias})`,
            'i',
          ),
          read: (match) => {
            const op = this.resolveOp(match[1] ?? '');
            const value = this.parseNumber(match[2] ?? '');

            return op && value !== null ? { op, value } : null;
          },
        },
        {
          regex: new RegExp(
            `(?:${alias})\\s*[:=]\\s*(\\d+(?:[.,]\\d+)?)`,
            'i',
          ),
          read: (match) => {
            const value = this.parseNumber(match[1] ?? '');

            return value !== null ? { op: 'gte', value } : null;
          },
        },
      ];

      for (const item of patterns) {
        const match = next.match(item.regex);

        if (!match) {
          continue;
        }

        const constraint = item.read(match);

        if (!constraint) {
          continue;
        }

        filter[metric] = constraint;
        next = next.replace(match[0], ' ');
        break;
      }
    }

    return this.normalizeSpaces(next);
  }

  /**
   * @param {string} raw - оператор из запроса
   * @returns {MetricCompareOp | null} нормализованный op
   */
  private resolveOp(raw: string): MetricCompareOp | null {
    for (const item of OP_PATTERNS) {
      if (item.pattern.test(raw)) {
        return item.op;
      }
    }

    return null;
  }

  /**
   * @param {string} raw - число
   * @returns {number | null} parsed
   */
  private parseNumber(raw: string): number | null {
    const value = Number(raw.replace(',', '.').replace(/\s/g, ''));

    return Number.isFinite(value) ? value : null;
  }

  /**
   * @param {string} text - текст
   * @returns {string} без лишних пробелов
   */
  private normalizeSpaces(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}

export const aiSearchService = new AiSearchService();
