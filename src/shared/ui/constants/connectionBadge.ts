import { ConnectionStatus } from '@/shared/config';

export const CONNECTION_BADGE_ID = 'connection-badge';

export const CONNECTION_LABELS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Connecting]: 'Connecting',
  [ConnectionStatus.Connected]: 'Live server connection',
  [ConnectionStatus.Disconnected]: 'Offline',
};

export const CONNECTION_TOOLTIPS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Connecting]: 'Connecting to realtime updates…',
  [ConnectionStatus.Connected]: 'Realtime updates are live',
  [ConnectionStatus.Disconnected]: 'Realtime updates are offline',
};

export const CONNECTION_ORB_CLASS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Connected]: 'connection-badge__orb--live',
  [ConnectionStatus.Connecting]: 'connection-badge__orb--connecting',
  [ConnectionStatus.Disconnected]: 'connection-badge__orb--offline',
};
