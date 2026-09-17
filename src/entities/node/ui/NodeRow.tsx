import {
  PERFORMANCE_BAR_CLASS,
  PERFORMANCE_CHIP_CLASS,
  TableColumnId,
} from '@/shared/config';
import {
  getDepthClass,
  getPerformanceLevel,
  getPerformanceWidthClass,
} from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import { NODE_CURRENCY, NODE_UI_MESSAGES } from '../constants';
import type { NodeRowProps } from '../types';

/**
 * Форматирует бюджет как `12 345 678 RUB`.
 *
 * @param {number} value - сумма бюджета
 * @returns {string} локализованная строка с суффиксом
 */
function getFormattedBudget(value: number): string {
  const amount = new Intl.NumberFormat(NODE_CURRENCY.locale, {
    maximumFractionDigits: 0,
    useGrouping: true,
  })
    .format(value)
    .replace(/\u00A0/g, ' ');

  return `${amount} ${NODE_CURRENCY.suffix}`;
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
  const perfLevel = getPerformanceLevel(node.performance);
  const hierarchyLevel = depth + 1;
  const nameId = `row-name-${node.id}`;
  const levelId = `row-level-${node.id}`;
  const headcountId = `row-hc-${node.id}`;
  const budgetId = `row-budget-${node.id}`;
  const perfId = `row-perf-${node.id}`;
  const budgetLabel = getFormattedBudget(node.budget);
  const nameCellClass = [
    'mdl-data-table__cell--non-numeric',
    'app-data-table__name-cell',
    getDepthClass('app-data-table__name-cell', depth),
  ].join(' ');
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
      case TableColumnId.Name:
        return (
          <td key={columnId} className={nameCellClass}>
            <span id={nameId}>{node.name}</span>
            <MdlTooltip forId={nameId}>
              {selected
                ? NODE_UI_MESSAGES.selected(node.name)
                : NODE_UI_MESSAGES.select(node.name)}
            </MdlTooltip>
          </td>
        );
      case TableColumnId.Level:
        return (
          <td key={columnId}>
            <span id={levelId}>{hierarchyLevel}</span>
            <MdlTooltip forId={levelId}>
              {NODE_UI_MESSAGES.level(hierarchyLevel)}
            </MdlTooltip>
          </td>
        );
      case TableColumnId.Headcount:
        return (
          <td key={columnId}>
            <span id={headcountId} className="mdl-chip mdl-color--grey-300">
              <span className="mdl-chip__text">{node.headcount}</span>
            </span>
            <MdlTooltip forId={headcountId}>
              {NODE_UI_MESSAGES.totalEmployees(node.headcount)}
            </MdlTooltip>
          </td>
        );
      case TableColumnId.Budget:
        return (
          <td key={columnId}>
            <span id={budgetId}>{budgetLabel}</span>
            <MdlTooltip forId={budgetId}>
              {NODE_UI_MESSAGES.totalBudget(budgetLabel)}
            </MdlTooltip>
          </td>
        );
      case TableColumnId.Performance:
        return (
          <td key={columnId}>
            <div id={perfId} className="app-perf-cell">
              <span
                className={`mdl-chip ${PERFORMANCE_CHIP_CLASS[perfLevel]}`}
                aria-label={NODE_UI_MESSAGES.averagePerformanceAria(
                  node.performance,
                )}
              >
                <span className="mdl-chip__text">{node.performance}</span>
              </span>
              <div className="mdl-progress app-progress-static" aria-hidden>
                <div
                  className={[
                    'progressbar',
                    'bar',
                    'bar1',
                    PERFORMANCE_BAR_CLASS[perfLevel],
                    getPerformanceWidthClass(node.performance),
                  ].join(' ')}
                />
              </div>
            </div>
            <MdlTooltip forId={perfId}>
              {NODE_UI_MESSAGES.averagePerformance(node.performance)}
            </MdlTooltip>
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
      aria-level={hierarchyLevel}
      aria-selected={selected}
      onClick={onSelect}
    >
      {columnOrder.map((columnId) => renderCell(columnId))}
    </tr>
  );
}
