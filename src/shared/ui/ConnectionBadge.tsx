import { ConnectionStatus } from '@/shared/config';
import type { ConnectionBadgeProps } from '@/shared/types';
import {
  CONNECTION_BADGE_ID,
  CONNECTION_CONTACT_COLOR,
  CONNECTION_CONTACT_MARK,
  CONNECTION_LABELS,
  CONNECTION_TOOLTIPS,
} from './constants';
import { MdlTooltip } from './mdlTooltip';

/**
 * Бейдж статуса realtime-соединения.
 *
 * @param {ConnectionBadgeProps} props - статус соединения
 * @returns {JSX.Element} MDL-chip со статусом
 */
export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const pulseClass =
    status === ConnectionStatus.Connecting ? ' app-chip-pulse' : '';

  return (
    <>
      <span
        id={CONNECTION_BADGE_ID}
        className="mdl-chip mdl-chip--contact mdl-color--white"
        aria-label={CONNECTION_TOOLTIPS[status]}
      >
        <span
          className={`mdl-chip__contact ${CONNECTION_CONTACT_COLOR[status]}${pulseClass}`}
          aria-hidden
        >
          {CONNECTION_CONTACT_MARK[status]}
        </span>
        <span className="mdl-chip__text mdl-color-text--grey-800">
          {CONNECTION_LABELS[status]}
        </span>
      </span>
      <MdlTooltip forId={CONNECTION_BADGE_ID}>
        {CONNECTION_TOOLTIPS[status]}
      </MdlTooltip>
    </>
  );
}
