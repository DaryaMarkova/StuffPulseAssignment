import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { NodeRow } from '@/entities/node';
import { buildTree, flattenVisible } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import type { TreeNode } from '@/shared/types';
import { useTableColumns } from '../model/useTableColumns';
import type { TableProps } from '../types';

const TABLE_PANEL_ID = 'analytics-table-panel';
const TABLE_EMPTY_ID = 'analytics-table-empty';

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
  flashIds,
  onSelect,
}: TableProps) {
  const roots = useMemo(() => buildTree(nodes), [nodes]);
  const rows = useMemo(
    () => collectScopedRows(roots, scopeIds),
    [roots, scopeIds],
  );

  const tableRef = useRef<HTMLTableElement>(null);
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

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusIndex((prev) => Math.min(prev + 1, last));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setFocusIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setFocusIndex(last);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const row = rows[focusIndex];
      if (row) {
        onSelect(row.id);
      }
    }
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
      aria-label="Analytics table"
    >
      <MdlTooltip forId={TABLE_PANEL_ID}>
        Analytics table — scoped to the selected tree node
      </MdlTooltip>
      <div className="mdl-card__supporting-text app-card__body app-card__body--flush mdl-color--white">
        {rows.length === 0 ? (
          <>
            <p
              id={TABLE_EMPTY_ID}
              className="mdl-color-text--grey-600 app-empty"
            >
              No nodes in scope.
            </p>
            <MdlTooltip forId={TABLE_EMPTY_ID}>
              No nodes match the current selection
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
                    style={{ width: `${widths[column.id]}px` }}
                  />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {columns.map((column) => {
                    const headerId = `col-${column.id}`;
                    const thClass = [
                      column.nonNumeric
                        ? 'mdl-data-table__cell--non-numeric app-data-table__name'
                        : '',
                      draggingId === column.id ? 'is-dragging' : '',
                      dropTargetId === column.id ? 'is-drop-target' : '',
                      resizingId === column.id ? 'is-resizing' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <th
                        key={column.id}
                        id={headerId}
                        data-column-id={column.id}
                        className={thClass || undefined}
                        style={{ width: `${widths[column.id]}px` }}
                      >
                        <span
                          className="app-data-table__header-label"
                          onPointerDown={(event) => {
                            startReorder(column.id, event);
                          }}
                        >
                          {column.label}
                        </span>
                        <button
                          type="button"
                          className={
                            resizingId === column.id
                              ? 'app-data-table__resize is-active'
                              : 'app-data-table__resize'
                          }
                          aria-label={`Resize ${column.label} column`}
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
                    highlighted={flashIds.has(row.id)}
                    selected={selectedId === row.id || focusIndex === index}
                    columnOrder={columnOrder}
                    onSelect={() => onSelect(row.id)}
                  />
                ))}
              </tbody>
            </table>
            {columns.map((column) => (
              <MdlTooltip key={column.id} forId={`col-${column.id}`}>
                {column.tooltip}
              </MdlTooltip>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
