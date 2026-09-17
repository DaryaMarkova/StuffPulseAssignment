/** Максимальная глубина для CSS-классов отступа (0–6). */
export const UI_MAX_DEPTH = 6;

/**
 * Класс отступа по глубине: `base--depth-N`.
 *
 * @param {string} base - базовое имя класса
 * @param {number} depth - глубина узла
 * @returns {string} класс с суффиксом depth
 */
export function getDepthClass(base: string, depth: number): string {
  const clamped = Math.min(Math.max(depth, 0), UI_MAX_DEPTH);
  return `${base}--depth-${clamped}`;
}

/**
 * Класс ширины progress-bar по performance (0–100).
 *
 * @param {number} value - значение performance
 * @returns {string} класс `app-progress-static__bar--N`
 */
export function getPerformanceWidthClass(value: number): string {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return `app-progress-static__bar--${clamped}`;
}
