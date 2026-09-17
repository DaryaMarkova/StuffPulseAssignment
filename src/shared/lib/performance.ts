import {
  PERFORMANCE_THRESHOLDS,
  PerformanceLevel,
} from '@/shared/config';

/**
 * Определяет уровень performance для UI-индикаторов.
 *
 * @param {number} value - значение performance (0–100)
 * @returns {PerformanceLevel} уровень low | mid | high
 */
export function getPerformanceLevel(value: number): PerformanceLevel {

  if (value < PERFORMANCE_THRESHOLDS.lowMax) {
    return PerformanceLevel.Low;
  }

  if (value < PERFORMANCE_THRESHOLDS.midMax) {
    return PerformanceLevel.Mid;
  }

  return PerformanceLevel.High;
}
