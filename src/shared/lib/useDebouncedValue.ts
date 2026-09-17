import { useEffect, useState } from 'react';

/**
 * Возвращает значение с задержкой (debounce).
 *
 * @param {T} value - исходное значение
 * @param {number} delayMs - задержка в миллисекундах
 * @returns {T} отложенное значение
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [value, delayMs]);

  return debounced;
}
