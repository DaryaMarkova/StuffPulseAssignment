import { useEffect, useRef } from 'react';
import { upgradeMdlElement } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import { DASHBOARD_IDS, DASHBOARD_MESSAGES } from '../constants';
import type { FilterProps } from '../types';

/**
 * Поле AI-поиска: NL → structured filter, иначе текстовый fallback.
 *
 * @param {FilterProps} props - значение, режим и обработчик
 * @returns {JSX.Element} MDL text field
 */
export function Filter({ value, onChange, searchMode = 'none' }: FilterProps) {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    upgradeMdlElement(fieldRef.current);
  }, []);

  const modeLabel =
    searchMode === 'structured'
      ? DASHBOARD_MESSAGES.filterModeAi
      : searchMode === 'text'
        ? DASHBOARD_MESSAGES.filterModeText
        : null;

  return (
    <div className="app-filter">
      <div
        ref={fieldRef}
        className="mdl-textfield mdl-js-textfield app-filter__field"
      >
        <i
          id={DASHBOARD_IDS.filterIcon}
          className="material-icons app-filter__icon"
          aria-hidden
        >
          search
        </i>
        <input
          className="mdl-textfield__input app-filter__input"
          type="search"
          id={DASHBOARD_IDS.filter}
          value={value}
          placeholder={DASHBOARD_MESSAGES.filterPlaceholder}
          aria-label={DASHBOARD_MESSAGES.filterLabel}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        {modeLabel ? (
          <span className="app-filter__mode" aria-live="polite">
            {modeLabel}
          </span>
        ) : null}
      </div>
      <MdlTooltip forId={DASHBOARD_IDS.filter}>
        {DASHBOARD_MESSAGES.filterTooltip}
      </MdlTooltip>
    </div>
  );
}
