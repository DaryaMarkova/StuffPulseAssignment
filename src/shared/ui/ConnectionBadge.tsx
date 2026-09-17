import { ConnectionStatus } from '@/shared/config';
import type { ConnectionBadgeProps } from '@/shared/types';
import {
  CONNECTION_BADGE_ID,
  CONNECTION_LABELS,
  CONNECTION_ORB_CLASS,
  CONNECTION_TOOLTIPS,
} from './constants';
import { MdlTooltip } from './mdlTooltip';

/**
 * Бейдж статуса realtime-соединения в стиле Skype presence.
 *
 * @param {ConnectionBadgeProps} props - статус соединения
 * @returns {JSX.Element} индикатор соединения
 */
export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const isConnecting = status === ConnectionStatus.Connecting;

  return (
    <>
      <span
        id={CONNECTION_BADGE_ID}
        className="connection-badge"
        aria-label={CONNECTION_TOOLTIPS[status]}
      >
        <span
          className={`connection-badge__orb ${CONNECTION_ORB_CLASS[status]}${
            isConnecting ? ' connection-badge__orb--pulse' : ''
          }`}
          aria-hidden
        />
        <span className="connection-badge__label">
          {CONNECTION_LABELS[status]}
        </span>
      </span>
      <MdlTooltip forId={CONNECTION_BADGE_ID}>
        {CONNECTION_TOOLTIPS[status]}
      </MdlTooltip>
    </>
  );
}
