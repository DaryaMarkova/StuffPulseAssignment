import { useEffect, useRef } from 'react';
import { upgradeMdlElement } from '@/shared/lib';
import type { MdlTooltipProps } from '@/shared/types';

/**
 * MDL tooltip, привязанный к элементу по `forId`.
 *
 * @param {MdlTooltipProps} props - id цели и содержимое
 * @returns {JSX.Element} разметка `.mdl-tooltip`
 */
export function MdlTooltip({ forId, children, className }: MdlTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.setAttribute('for', forId);
    upgradeMdlElement(element);

    return () => {
      window.componentHandler?.downgradeElements(element);
    };
  }, [forId, children]);

  return (
    <div
      ref={ref}
      className={className ? `mdl-tooltip ${className}` : 'mdl-tooltip'}
    >
      {children}
    </div>
  );
}
