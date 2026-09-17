import { ConnectionBadge, MdlTooltip } from '@/shared/ui';
import { HEADER_IDS, HEADER_MESSAGES } from '../constants';
import type { AppHeaderProps } from '../types';

/**
 * Шапка приложения с брендом и статусом соединения.
 *
 * @param {AppHeaderProps} props - статус соединения
 * @returns {JSX.Element} MDL header
 */
export function AppHeader({ status }: AppHeaderProps) {
  return (
    <header className="mdl-layout__header">
      <div className="mdl-layout__header-row">
        <i
          id={HEADER_IDS.icon}
          className="material-icons app-header__icon"
          aria-hidden
        >
          {HEADER_MESSAGES.iconName}
        </i>
        <MdlTooltip forId={HEADER_IDS.icon}>
          {HEADER_MESSAGES.iconTooltip}
        </MdlTooltip>

        <span id={HEADER_IDS.brand} className="mdl-layout__title">
          <span className="app-header-brand">
            <span className="app-header-brand__eyebrow">
              {HEADER_MESSAGES.brandEyebrow}
            </span>
            <span>{HEADER_MESSAGES.brandTitle}</span>
          </span>
        </span>
        <MdlTooltip forId={HEADER_IDS.brand}>
          {HEADER_MESSAGES.brandTooltip}
        </MdlTooltip>

        <div className="mdl-layout-spacer" />
        <nav className="mdl-navigation">
          <ConnectionBadge status={status} />
        </nav>
      </div>
    </header>
  );
}
