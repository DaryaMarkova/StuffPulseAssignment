import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { TableColumnId } from '@/shared/types';
import { COLUMN_REORDER_DRAG_THRESHOLD_PX } from '../constants';
import { TABLE_COLUMNS } from '../model/tableColumns';
import type { ColumnWidths, ResizeDrag, TableColumn } from '../types';

/**
 * Создаёт карту ширин по умолчанию.
 *
 * @param {readonly TableColumn[]} columns - описание колонок
 * @returns {ColumnWidths} ширины по id
 */
function createDefaultWidths(columns: readonly TableColumn[]): ColumnWidths {
  return Object.fromEntries(
    columns.map((column) => [column.id, column.defaultWidth]),
  ) as ColumnWidths;
}

/**
 * Управляет порядком и шириной колонок таблицы.
 *
 * @returns состояние колонок и обработчики resize / reorder
 */
export function useTableColumns() {
  const [order, setOrder] = useState<TableColumnId[]>(() =>
    TABLE_COLUMNS.map((column) => column.id),
  );

  const [widths, setWidths] = useState<ColumnWidths>(() =>
    createDefaultWidths(TABLE_COLUMNS),
  );
  
  const [resizingId, setResizingId] = useState<TableColumnId | null>(null);
  const [draggingId, setDraggingId] = useState<TableColumnId | null>(null);
  const [dropTargetId, setDropTargetId] = useState<TableColumnId | null>(null);

  const resizeRef = useRef<ResizeDrag | null>(null);
  const dropTargetRef = useRef<TableColumnId | null>(null);
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  const columnsById = useMemo(
    () =>
      Object.fromEntries(
        TABLE_COLUMNS.map((column) => [column.id, column]),
      ) as Record<TableColumnId, TableColumn>,
    [],
  );

  const columns = order.map((id) => columnsById[id]);

  /**
   * Начинает изменение ширины колонки на самом handle с pointer capture.
   *
   * @param {TableColumnId} columnId - id колонки
   * @param {ReactPointerEvent<HTMLElement>} event - pointer-событие
   * @returns {void}
   */
  const startResize = useCallback(
    (columnId: TableColumnId, event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const target = event.currentTarget;
      const pointerId = event.pointerId;

      resizeRef.current = {
        columnId,
        startX: event.clientX,
        startWidth: widthsRef.current[columnId],
      };
      setResizingId(columnId);
      target.setPointerCapture(pointerId);

      /**
       * Обновляет ширину по движению указателя.
       *
       * @param {PointerEvent} moveEvent - pointermove
       * @returns {void}
       */
      const onPointerMove = (moveEvent: PointerEvent) => {
        const drag = resizeRef.current;

        if (!drag) {
          return;
        }

        const column = columnsById[drag.columnId];
        const next = Math.max(
          column.minWidth,
          Math.min(640, drag.startWidth + (moveEvent.clientX - drag.startX)),
        );

        setWidths((prev) => {

          if (prev[drag.columnId] === next) {
            return prev;
          }

          return {
            ...prev,
            [drag.columnId]: next,
          };
        });
      };

      /**
       * Завершает resize и снимает слушатели.
       *
       * @returns {void}
       */
      const onPointerUp = () => {
        resizeRef.current = null;
        setResizingId(null);

        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId);
        }

        target.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerup', onPointerUp);
        target.removeEventListener('pointercancel', onPointerUp);
      };

      target.addEventListener('pointermove', onPointerMove);
      target.addEventListener('pointerup', onPointerUp);
      target.addEventListener('pointercancel', onPointerUp);
    },
    [columnsById],
  );

  /**
   * Переставляет колонку: вставляет `fromId` перед `toId`.
   *
   * @param {TableColumnId} fromId - перетаскиваемая колонка
   * @param {TableColumnId} toId - колонка-цель
   * @returns {void}
   */
  const moveColumn = useCallback((fromId: TableColumnId, toId: TableColumnId) => {

    if (fromId === toId) {
      return;
    }

    setOrder((prev) => {
      const next = prev.filter((id) => id !== fromId);
      const targetIndex = next.indexOf(toId);

      if (targetIndex < 0) {
        return prev;
      }

      next.splice(targetIndex, 0, fromId);
      return next;
    });
  }, []);

  /**
   * Начинает перестановку колонки с отдельной drag-ручки.
   *
   * @param {TableColumnId} columnId - id колонки
   * @param {ReactPointerEvent<HTMLElement>} event - pointer-событие
   * @returns {void}
   */
  const startReorder = useCallback(
    (columnId: TableColumnId, event: ReactPointerEvent<HTMLElement>) => {

      if (resizingId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const target = event.currentTarget;
      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;
      dropTargetRef.current = null;
      setDraggingId(columnId);
      setDropTargetId(null);
      target.setPointerCapture(pointerId);

      /**
       * Определяет колонку под курсором и подсвечивает цель.
       *
       * @param {PointerEvent} moveEvent - pointermove
       * @returns {void}
       */
      const onPointerMove = (moveEvent: PointerEvent) => {

        if (
          !moved &&
          (Math.abs(moveEvent.clientX - startX) >
            COLUMN_REORDER_DRAG_THRESHOLD_PX ||
            Math.abs(moveEvent.clientY - startY) >
              COLUMN_REORDER_DRAG_THRESHOLD_PX)
        ) {
          moved = true;
        }

        if (!moved) {
          return;
        }

        const el = document.elementFromPoint(
          moveEvent.clientX,
          moveEvent.clientY,
        );
        const th = el?.closest('th[data-column-id]') as HTMLElement | null;
        const targetId = th?.dataset.columnId as TableColumnId | undefined;

        if (targetId && targetId !== columnId) {
          dropTargetRef.current = targetId;
          setDropTargetId(targetId);
          return;
        }

        dropTargetRef.current = null;
        setDropTargetId(null);
      };

      /**
       * Завершает перестановку.
       *
       * @returns {void}
       */
      const onPointerUp = () => {
        const currentTarget = dropTargetRef.current;

        if (moved && currentTarget) {
          moveColumn(columnId, currentTarget);
        }

        dropTargetRef.current = null;
        setDropTargetId(null);
        setDraggingId(null);

        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId);
        }

        target.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerup', onPointerUp);
        target.removeEventListener('pointercancel', onPointerUp);
      };

      target.addEventListener('pointermove', onPointerMove);
      target.addEventListener('pointerup', onPointerUp);
      target.addEventListener('pointercancel', onPointerUp);
    },
    [moveColumn, resizingId],
  );

  return {
    columns,
    columnOrder: order,
    widths,
    resizingId,
    draggingId,
    dropTargetId,
    startResize,
    startReorder,
  };
}
