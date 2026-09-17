import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { KeyboardKey } from '@/shared/config';
import { MdlTooltip } from '@/shared/ui';
import {
  SPLIT_DIVIDER_ID,
  SPLIT_LAYOUT,
  SPLIT_MESSAGES,
} from '../constants';
import type { SplitViewProps } from '../types';

/**
 * Разделяемый layout с перетаскиваемым разделителем.
 *
 * @param {SplitViewProps} props - левая и правая панели
 * @returns {JSX.Element} разметка split-view
 */
export function SplitView({ left, right }: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number>(SPLIT_LAYOUT.defaultLeft);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number }>({
    startX: 0,
    startWidth: SPLIT_LAYOUT.defaultLeft,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.style.setProperty('--split-left-width', `${leftWidth}px`);
  }, [leftWidth]);

  /**
   * Ограничивает ширину левой панели допустимым диапазоном.
   *
   * @param {number} width - желаемая ширина
   * @param {number} containerWidth - ширина контейнера
   * @returns {number} ширина в допустимых границах
   */
  const clampWidth = useCallback((width: number, containerWidth: number) => {
    const max = Math.min(
      SPLIT_LAYOUT.maxLeft,
      Math.max(SPLIT_LAYOUT.minLeft, containerWidth - SPLIT_LAYOUT.rightReserve),
    );
    return Math.min(max, Math.max(SPLIT_LAYOUT.minLeft, width));
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
      <aside className="app-split__left">{left}</aside>

      <div
        id={SPLIT_DIVIDER_ID}
        className={
          dragging ? 'app-split__divider is-active' : 'app-split__divider'
        }
        role="separator"
        aria-orientation="vertical"
        aria-label={SPLIT_MESSAGES.resizeAriaLabel}
        aria-valuenow={Math.round(leftWidth)}
        aria-valuemin={SPLIT_LAYOUT.minLeft}
        aria-valuemax={SPLIT_LAYOUT.maxLeft}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          const container = containerRef.current;

          if (!container) {
            return;
          }

          if (event.key === KeyboardKey.ArrowLeft) {
            event.preventDefault();
            setLeftWidth((prev) =>
              clampWidth(
                prev - SPLIT_LAYOUT.keyboardStep,
                container.clientWidth,
              ),
            );
          }

          if (event.key === KeyboardKey.ArrowRight) {
            event.preventDefault();
            setLeftWidth((prev) =>
              clampWidth(
                prev + SPLIT_LAYOUT.keyboardStep,
                container.clientWidth,
              ),
            );
          }

        }}
      />
      <MdlTooltip forId={SPLIT_DIVIDER_ID}>
        {SPLIT_MESSAGES.resizeTooltip}
      </MdlTooltip>

      <main className="app-split__right">{right}</main>
    </div>
  );
}
