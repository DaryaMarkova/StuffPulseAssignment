import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { MdlTooltip } from '@/shared/ui';
import type { SplitViewProps } from '../types';

const SPLIT_DIVIDER_ID = 'app-split-divider';

const MIN_LEFT = 220;
const MAX_LEFT = 560;
const DEFAULT_LEFT = 320;

/**
 * Разделяемый layout с перетаскиваемым разделителем.
 *
 * @param {SplitViewProps} props - левая и правая панели
 * @returns {JSX.Element} разметка split-view
 */
export function SplitView({ left, right }: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startWidth: DEFAULT_LEFT });

  /**
   * Ограничивает ширину левой панели допустимым диапазоном.
   *
   * @param {number} width - желаемая ширина
   * @param {number} containerWidth - ширина контейнера
   * @returns {number} ширина в допустимых границах
   */
  const clampWidth = useCallback((width: number, containerWidth: number) => {
    const max = Math.min(MAX_LEFT, Math.max(MIN_LEFT, containerWidth - 280));
    return Math.min(max, Math.max(MIN_LEFT, width));
  }, []);

  /**
   * Начинает перетаскивание разделителя с pointer capture на самом элементе.
   *
   * @param {ReactPointerEvent<HTMLDivElement>} event - pointer-событие
   * @returns {void}
   */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget;
    const pointerId = event.pointerId;

    dragRef.current = {
      startX: event.clientX,
      startWidth: leftWidth,
    };
    setDragging(true);
    target.setPointerCapture(pointerId);

    /**
     * Обновляет ширину левой панели.
     *
     * @param {PointerEvent} moveEvent - pointermove
     * @returns {void}
     */
    const onPointerMove = (moveEvent: PointerEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const delta = moveEvent.clientX - dragRef.current.startX;
      const next = clampWidth(
        dragRef.current.startWidth + delta,
        container.clientWidth,
      );
      setLeftWidth(next);
    };

    /**
     * Завершает перетаскивание.
     *
     * @returns {void}
     */
    const onPointerUp = () => {
      setDragging(false);

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
  };

  return (
    <div
      ref={containerRef}
      className={dragging ? 'app-split is-dragging' : 'app-split'}
    >
      <aside className="app-split__left" style={{ width: leftWidth }}>
        {left}
      </aside>

      <div
        id={SPLIT_DIVIDER_ID}
        className={
          dragging ? 'app-split__divider is-active' : 'app-split__divider'
        }
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        aria-valuenow={Math.round(leftWidth)}
        aria-valuemin={MIN_LEFT}
        aria-valuemax={MAX_LEFT}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          const container = containerRef.current;
          if (!container) {
            return;
          }

          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setLeftWidth((prev) =>
              clampWidth(prev - 16, container.clientWidth),
            );
          }

          if (event.key === 'ArrowRight') {
            event.preventDefault();
            setLeftWidth((prev) =>
              clampWidth(prev + 16, container.clientWidth),
            );
          }
        }}
      />
      <MdlTooltip forId={SPLIT_DIVIDER_ID}>Drag to resize panels</MdlTooltip>

      <main className="app-split__right">{right}</main>
    </div>
  );
}
