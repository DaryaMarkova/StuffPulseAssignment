import { ConnectionBadge, MdlTooltip } from '@/shared/ui';
import type { AppHeaderProps } from '../types';

const HEADER_ICON_ID = 'app-header-icon';
const HEADER_BRAND_ID = 'app-header-brand';

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
          id={HEADER_ICON_ID}
          className="material-icons"
          aria-hidden
          style={{ marginRight: 16 }}
        >
          account_tree
        </i>
        <MdlTooltip forId={HEADER_ICON_ID}>Organization structure</MdlTooltip>

        <span id={HEADER_BRAND_ID} className="mdl-layout__title">
          <span className="app-header-brand">
            <span className="app-header-brand__eyebrow">StuffPulse</span>
            <span>Organization pulse</span>
          </span>
        </span>
        <MdlTooltip forId={HEADER_BRAND_ID}>
          StuffPulse organization dashboard
        </MdlTooltip>

        <div className="mdl-layout-spacer" />
        <nav className="mdl-navigation">
          <ConnectionBadge status={status} />
        </nav>
      </div>
    </header>
  );
}
