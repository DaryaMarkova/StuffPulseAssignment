import { MdlTooltip } from '@/shared/ui';
import type { ConnectionBadgeProps } from '@/shared/types';

const LABELS: Record<ConnectionBadgeProps['status'], string> = {
  connecting: 'Connecting',
  connected: 'Live',
  disconnected: 'Offline',
};

const TOOLTIPS: Record<ConnectionBadgeProps['status'], string> = {
  connecting: 'Connecting to realtime updates…',
  connected: 'Realtime updates are live',
  disconnected: 'Realtime updates are offline',
};

const CONTACT_COLOR: Record<ConnectionBadgeProps['status'], string> = {
  connected: 'mdl-color--amber-700 mdl-color-text--white',
  connecting: 'mdl-color--orange mdl-color-text--white',
  disconnected: 'mdl-color--grey mdl-color-text--white',
};

const BADGE_ID = 'connection-badge';

/**
 * Бейдж статуса realtime-соединения.
 *
 * @param {ConnectionBadgeProps} props - статус соединения
 * @returns {JSX.Element} MDL-chip со статусом
 */
export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  return (
    <>
      <span
        id={BADGE_ID}
        className="mdl-chip mdl-chip--contact mdl-color--white"
        aria-label={TOOLTIPS[status]}
      >
        <span
          className={`mdl-chip__contact ${CONTACT_COLOR[status]}${status === 'connecting' ? ' app-chip-pulse' : ''}`}
          aria-hidden
        >
          {status === 'connected' ? 'L' : status === 'connecting' ? '…' : '–'}
        </span>
        <span className="mdl-chip__text mdl-color-text--grey-800">
          {LABELS[status]}
        </span>
      </span>
      <MdlTooltip forId={BADGE_ID}>{TOOLTIPS[status]}</MdlTooltip>
    </>
  );
}
