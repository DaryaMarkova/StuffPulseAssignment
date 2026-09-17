import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { NodeRow } from '@/entities/node';
import { KeyboardKey, TableColumnId } from '@/shared/config';
import { buildTree, flattenVisible } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import type { TreeNode } from '@/shared/types';
import {
  AriaSort,
  SORT_CLICK_DELAY_MS,
  SORT_HINT_MARK,
  SORT_MARK,
  SortDirection,
  TABLE_EMPTY_ID,
  TABLE_MESSAGES,
  TABLE_PANEL_ID,
  reorderColumnLabel,
  resizeColumnLabel,
} from '../constants';
import type { TableProps } from '../types';
import { useTableColumns } from '../utils/useTableColumns';
import { sortTableRows, useTableSort } from '../utils/useTableSort';

const METRIC_COLUMNS = [
  TableColumnId.Headcount,
  TableColumnId.Budget,
  TableColumnId.Performance,
] as const;

/**
 * Колонки строки с активной подсветкой патча.
 *
 * @param {ReadonlySet<string>} flashCells - ключи `nodeId:columnId`
 * @param {string} nodeId - id узла
 * @returns {ReadonlySet<TableColumnId>} набор колонок
 */
function getFlashColumns(
  flashCells: ReadonlySet<string>,
  nodeId: string,
): ReadonlySet<TableColumnId> {
  const columns = new Set<TableColumnId>();

  for (const columnId of METRIC_COLUMNS) {

    if (flashCells.has(`${nodeId}:${columnId}`)) {
      columns.add(columnId);
    }

  }

  return columns;
}
/**
 * Собирает видимые строки таблицы с учётом scope.
 *
 * @param {TreeNode[]} roots - корни дерева
 * @param {ReadonlySet<string> | null} scopeIds - id в scope или `null`
 * @returns {TreeNode[]} строки таблицы
 */
function collectScopedRows(
  roots: TreeNode[],
  scopeIds: ReadonlySet<string> | null,
): TreeNode[] {
  const allExpanded = new Set<string>();

  /**
   * Помечает все узлы как раскрытые для полного flatten.
   *
   * @param {TreeNode[]} items - узлы текущего уровня
   * @returns {void}
   */
  const mark = (items: TreeNode[]): void => {
    for (const item of items) {
      allExpanded.add(item.id);
      mark(item.children);
    }
  };

  mark(roots);

  const flat = flattenVisible(roots, allExpanded);

  if (!scopeIds) {
    return flat;
  }

  return flat.filter((row) => scopeIds.has(row.id));
}

/**
 * Виджет аналитической таблицы узлов.
 *
 * @param {TableProps} props - узлы, scope, выбор и подсветка
 * @returns {JSX.Element} карточка таблицы
 */
export function Table({
  nodes,
  scopeIds,
  selectedId,
  flashCells,
  onSelect,
}: TableProps) {
  const roots = useMemo(() => buildTree(nodes), [nodes]);
  const scopedRows = useMemo(
    () => collectScopedRows(roots, scopeIds),
    [roots, scopeIds],
  );

  const tableRef = useRef<HTMLTableElement>(null);
  const sortClickTimerRef = useRef<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const {
    columns,
    columnOrder,
    widths,
    resizingId,
    draggingId,
    dropTargetId,
    startResize,
    startReorder,
  } = useTableColumns();

  const { sort, sortAscending, reverseSort } = useTableSort();

  const rows = useMemo(
    () => sortTableRows(scopedRows, sort),
    [scopedRows, sort],
  );

  useLayoutEffect(() => {
    const table = tableRef.current;

    if (!table) {
      return;
    }

    for (const column of columns) {
      table.style.setProperty(
        `--col-${column.id}-width`,
        `${widths[column.id]}px`,
      );
    }
  }, [columns, widths]);

  useEffect(() => {

    if (rows.length === 0) {
      setFocusIndex(0);
      return;
    }

    if (selectedId) {
      const index = rows.findIndex((row) => row.id === selectedId);
      

      if (index >= 0) {
        setFocusIndex(index);
        return;
      }

    }

    setFocusIndex((prev) => Math.min(prev, rows.length - 1));
  }, [rows, selectedId]);

  useEffect(() => {
    return () => {

      if (sortClickTimerRef.current !== null) {
        window.clearTimeout(sortClickTimerRef.current);
      }

    };
  }, []);

  /**
   * Обрабатывает клавиатурную навигацию по строкам.
   *
   * @param {KeyboardEvent<HTMLTableElement>} event - событие клавиатуры
   * @returns {void}
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {

    if (rows.length === 0) {
      return;
    }

    const last = rows.length - 1;

    if (event.key === KeyboardKey.ArrowDown) {
      event.preventDefault();
      setFocusIndex((prev) => Math.min(prev + 1, last));
      return;
    }

    if (event.key === KeyboardKey.ArrowUp) {
      event.preventDefault();
      setFocusIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === KeyboardKey.Home) {
      event.preventDefault();
      setFocusIndex(0);
      return;
    }

    if (event.key === KeyboardKey.End) {
      event.preventDefault();
      setFocusIndex(last);
      return;
    }

    if (event.key === KeyboardKey.Enter) {
      event.preventDefault();
      const row = rows[focusIndex];

      if (row) {
        onSelect(row.id);
      }

    }

  };

  /**
   * Одиночный клик — сортировка по возрастанию (с задержкой под dblclick).
   *
   * @param {TableColumnId} columnId - id колонки
   * @returns {void}
   */
  const handleSortClick = (columnId: TableColumnId) => {

    if (sortClickTimerRef.current !== null) {
      window.clearTimeout(sortClickTimerRef.current);
    }

    sortClickTimerRef.current = window.setTimeout(() => {
      sortAscending(columnId);
      sortClickTimerRef.current = null;
    }, SORT_CLICK_DELAY_MS);
  };

  /**
   * Двойной клик — обратная сортировка.
   *
   * @param {TableColumnId} columnId - id колонки
   * @returns {void}
   */
  const handleSortDoubleClick = (columnId: TableColumnId) => {

    if (sortClickTimerRef.current !== null) {
      window.clearTimeout(sortClickTimerRef.current);
      sortClickTimerRef.current = null;
    }

    reverseSort(columnId);
  };

  useEffect(() => {
    const row = rows[focusIndex];

    if (!row || !tableRef.current) {
      return;
    }

    const el = tableRef.current.querySelector<HTMLElement>(
      `[data-node-id="${row.id}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusIndex, rows]);

  return (
    <section
      id={TABLE_PANEL_ID}
      className="mdl-card mdl-shadow--2dp app-card"
      aria-label={TABLE_MESSAGES.ariaLabel}
    >
      <MdlTooltip forId={TABLE_PANEL_ID}>
        {TABLE_MESSAGES.panelTooltip}
      </MdlTooltip>
      <div className="mdl-card__supporting-text app-card__body app-card__body--flush mdl-color--white">
        {rows.length === 0 ? (
          <>
            <p
              id={TABLE_EMPTY_ID}
              className="mdl-color-text--grey-600 app-empty"
            >
              {TABLE_MESSAGES.empty}
            </p>
            <MdlTooltip forId={TABLE_EMPTY_ID}>
              {TABLE_MESSAGES.emptyTooltip}
            </MdlTooltip>
          </>
        ) : (
          <div
            className={
              resizingId || draggingId
                ? 'app-table-scroll is-resizing'
                : 'app-table-scroll'
            }
          >
            <table
              ref={tableRef}
              className="mdl-data-table mdl-js-data-table app-data-table"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <colgroup>
                {columns.map((column) => (
                  <col
                    key={column.id}
                    className={`app-data-table__col app-data-table__col--${column.id}`}
                  />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {columns.map((column) => {
                    const headerId = `col-${column.id}`;
                    const isSorted = sort?.columnId === column.id;
                    const thClass = [
                      'app-data-table__header',
                      `app-data-table__header--${column.id}`,
                      column.nonNumeric
                        ? 'mdl-data-table__cell--non-numeric app-data-table__name'
                        : '',
                      draggingId === column.id ? 'is-dragging' : '',
                      dropTargetId === column.id ? 'is-drop-target' : '',
                      resizingId === column.id ? 'is-resizing' : '',
                      isSorted ? 'is-sorted' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <th
                        key={column.id}
                        id={headerId}
                        data-column-id={column.id}
                        className={thClass || undefined}
                        aria-sort={
                          isSorted
                            ? sort.direction === SortDirection.Asc
                              ? AriaSort.Ascending
                              : AriaSort.Descending
                            : AriaSort.None
                        }
                      >
                        <button
                          type="button"
                          className="app-data-table__drag"
                          aria-label={reorderColumnLabel(column.label)}
                          tabIndex={-1}
                          onPointerDown={(event) => {
                            startReorder(column.id, event);
                          }}
                        >
                          <i className="material-icons" aria-hidden>
                            drag_indicator
                          </i>
                        </button>
                        <button
                          type="button"
                          className="app-data-table__header-label"
                          onClick={() => {
                            handleSortClick(column.id);
                          }}
                          onDoubleClick={() => {
                            handleSortDoubleClick(column.id);
                          }}
                        >
                          <span className="app-data-table__header-text">
                            {column.label}
                          </span>
                          <span
                            className={
                              isSorted
                                ? 'app-data-table__sort-mark is-active'
                                : 'app-data-table__sort-mark'
                            }
                            aria-hidden
                          >
                            {isSorted
                              ? SORT_MARK[sort.direction]
                              : SORT_HINT_MARK}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={
                            resizingId === column.id
                              ? 'app-data-table__resize is-active'
                              : 'app-data-table__resize'
                          }
                          aria-label={resizeColumnLabel(column.label)}
                          tabIndex={-1}
                          onPointerDown={(event) => {
                            startResize(column.id, event);
                          }}
                        />
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <NodeRow
                    key={row.id}
                    node={row}
                    depth={row.depth}
                    flashColumns={getFlashColumns(flashCells, row.id)}
                    selected={selectedId === row.id || focusIndex === index}
                    columnOrder={columnOrder}
                    onSelect={() => onSelect(row.id)}
                  />
                ))}
              </tbody>
            </table>
            {columns.map((column) => (
              <MdlTooltip key={column.id} forId={`col-${column.id}`}>
                {`${column.tooltip}. ${TABLE_MESSAGES.sortHint}`}
              </MdlTooltip>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
