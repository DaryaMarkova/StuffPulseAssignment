import { ConnectionStatus } from '@/shared/config';

export const CONNECTION_BADGE_ID = 'connection-badge';

export const CONNECTION_LABELS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Connecting]: 'Connecting',
  [ConnectionStatus.Connected]: 'Live',
  [ConnectionStatus.Disconnected]: 'Offline',
};

export const CONNECTION_TOOLTIPS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Connecting]: 'Connecting to realtime updates…',
  [ConnectionStatus.Connected]: 'Realtime updates are live',
  [ConnectionStatus.Disconnected]: 'Realtime updates are offline',
};

export const CONNECTION_CONTACT_COLOR: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Connected]:
    'mdl-color--amber-700 mdl-color-text--white',
  [ConnectionStatus.Connecting]: 'mdl-color--orange mdl-color-text--white',
  [ConnectionStatus.Disconnected]: 'mdl-color--grey mdl-color-text--white',
};

export const CONNECTION_CONTACT_MARK: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Connected]: 'L',
  [ConnectionStatus.Connecting]: '…',
  [ConnectionStatus.Disconnected]: '–',
};
