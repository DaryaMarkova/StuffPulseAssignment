import { useEffect, useRef } from 'react';
import { upgradeMdlElement } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import { DASHBOARD_IDS, DASHBOARD_MESSAGES } from '../constants';
import type { FilterProps } from '../types';

/**
 * Поле фильтрации узлов по названию.
 *
 * @param {FilterProps} props - значение и обработчик изменения
 * @returns {JSX.Element} MDL text field
 */
export function Filter({ value, onChange }: FilterProps) {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    upgradeMdlElement(fieldRef.current);
  }, []);

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
      </div>
      <MdlTooltip forId={DASHBOARD_IDS.filter}>
        {DASHBOARD_MESSAGES.filterTooltip}
      </MdlTooltip>
    </div>
  );
}
