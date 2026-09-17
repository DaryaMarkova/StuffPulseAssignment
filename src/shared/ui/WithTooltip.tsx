import { MdlTooltip } from './mdlTooltip';
import type { WithTooltipProps } from '@/shared/types';

/**
 * Оборачивает содержимое в `span` с MDL-тултипом.
 *
 * @param {WithTooltipProps} props - id, текст тултипа и children
 * @returns {JSX.Element} цель + `.mdl-tooltip`
 */
export function WithTooltip({
  id,
  tooltip,
  children,
  className,
}: WithTooltipProps) {
  return (
    <>
      <span id={id} className={className}>
        {children}
      </span>
      <MdlTooltip forId={id}>{tooltip}</MdlTooltip>
    </>
  );
}
