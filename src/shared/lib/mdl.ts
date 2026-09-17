import type { ComponentHandler } from '@/shared/types';

declare global {
  interface Window {
    componentHandler?: ComponentHandler;
  }
}

/**
 * Выполняет MDL `upgradeElement` для одного DOM-элемента.
 *
 * @param {Element | null} element - элемент для инициализации MDL
 * @returns {void}
 */
export function upgradeMdlElement(element: Element | null): void {

  if (!element || !window.componentHandler) {
    return;
  }

  window.componentHandler.upgradeElement(element);
}
