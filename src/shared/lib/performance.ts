import type { PerformanceLevel } from '@/shared/types';

/**
 * Определяет уровень performance для UI-индикаторов.
 *
 * @param {number} value - значение performance (0–100)
 * @returns {PerformanceLevel} уровень `low` | `mid` | `high`
 */
export function getPerformanceLevel(value: number): PerformanceLevel {
  if (value < 40) {
    return 'low';
  }

  if (value < 70) {
    return 'mid';
  }

  return 'high';
}
