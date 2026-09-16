import { getPerformanceLevel } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import type { TableColumnId } from '@/shared/types';
import type { NodeRowProps } from '../types';

const PERF_CHIP: Record<'low' | 'mid' | 'high', string> = {
  low: 'mdl-color--red-100 mdl-color-text--red-900',
  mid: 'mdl-color--amber-100 mdl-color-text--amber-900',
  high: 'mdl-color--deep-orange-100 mdl-color-text--deep-orange-900',
};

const PERF_BAR: Record<'low' | 'mid' | 'high', string> = {
  low: 'mdl-color--red',
  mid: 'mdl-color--amber',
  high: 'mdl-color--deep-orange',
};

/**
 * Форматирует бюджет в USD без дробной части.
 *
 * @param {number} value - сумма бюджета
 * @returns {string} локализованная валютная строка
 */
function formatBudget(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Строка аналитической таблицы узла.
 *
 * @param {NodeRowProps} props - узел, состояние и колбэк выбора
 * @returns {JSX.Element} элемент `<tr>`
 */
export function NodeRow({
  node,
  depth,
  highlighted,
  selected,
  columnOrder,
  onSelect,
}: NodeRowProps) {
  const level = getPerformanceLevel(node.performance);
  const nameId = `row-name-${node.id}`;
  const headcountId = `row-hc-${node.id}`;
  const budgetId = `row-budget-${node.id}`;
  const perfId = `row-perf-${node.id}`;
  const updatedId = `row-updated-${node.id}`;
  const budgetLabel = formatBudget(node.budget);
  const updatedLabel = new Date(node.updatedAt).toLocaleTimeString();
  const className = [
    selected ? 'is-selected mdl-color--deep-orange-50' : '',
    highlighted ? 'pulse-flash' : '',
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Рендерит ячейку по id колонки.
   *
   * @param {TableColumnId} columnId - id колонки
   * @returns {JSX.Element} ячейка `<td>`
   */
  const renderCell = (columnId: TableColumnId) => {
    switch (columnId) {
      case 'name':
        return (
          <td
            key={columnId}
            className="mdl-data-table__cell--non-numeric"
            style={{
              paddingLeft: `${16 + Math.min(depth, 6) * 16}px`,
              fontWeight: 500,
            }}
          >
            <span id={nameId}>{node.name}</span>
            <MdlTooltip forId={nameId}>
              {selected ? `Selected: ${node.name}` : `Select ${node.name}`}
            </MdlTooltip>
          </td>
        );
      case 'headcount':
        return (
          <td key={columnId}>
            <span id={headcountId} className="mdl-chip mdl-color--grey-300">
              <span className="mdl-chip__text">{node.headcount}</span>
            </span>
            <MdlTooltip forId={headcountId}>
              Headcount: {node.headcount}
            </MdlTooltip>
          </td>
        );
      case 'budget':
        return (
          <td key={columnId}>
            <span id={budgetId}>{budgetLabel}</span>
            <MdlTooltip forId={budgetId}>Budget: {budgetLabel}</MdlTooltip>
          </td>
        );
      case 'performance':
        return (
          <td key={columnId}>
            <div id={perfId} className="app-perf-cell">
              <span
                className={`mdl-chip ${PERF_CHIP[level]}`}
                aria-label={`Performance ${node.performance}`}
              >
                <span className="mdl-chip__text">{node.performance}</span>
              </span>
              <div className="mdl-progress app-progress-static" aria-hidden>
                <div
                  className={`progressbar bar bar1 ${PERF_BAR[level]}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, node.performance))}%`,
                  }}
                />
              </div>
            </div>
            <MdlTooltip forId={perfId}>
              Performance: {node.performance}
            </MdlTooltip>
          </td>
        );
      case 'updated':
        return (
          <td key={columnId} className="mdl-color-text--grey-600">
            <span id={updatedId}>{updatedLabel}</span>
            <MdlTooltip forId={updatedId}>Updated at {updatedLabel}</MdlTooltip>
          </td>
        );
      default:
        return null;
    }
  };

  return (
    <tr
      className={className || undefined}
      data-node-id={node.id}
      aria-level={depth + 1}
      aria-selected={selected}
      onClick={onSelect}
    >
      {columnOrder.map((columnId) => renderCell(columnId))}
    </tr>
  );
}
