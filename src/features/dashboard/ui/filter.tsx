import { useEffect, useRef, useState } from 'react';
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
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    upgradeMdlElement(fieldRef.current);
  }, []);

  const fieldClassName = [
    'mdl-textfield',
    'mdl-js-textfield',
    'mdl-textfield--floating-label',
    'app-filter__field',
    focused ? 'is-focused' : '',
    value ? 'is-dirty' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="app-filter">
      <i
        id={DASHBOARD_IDS.filterIcon}
        className="material-icons app-filter__icon"
        aria-hidden
      >
        search
      </i>
      <div ref={fieldRef} className={fieldClassName}>
        <input
          className="mdl-textfield__input"
          type="search"
          id={DASHBOARD_IDS.filter}
          value={value}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        <label className="mdl-textfield__label" htmlFor={DASHBOARD_IDS.filter}>
          {DASHBOARD_MESSAGES.filterPlaceholder}
        </label>
      </div>
      <MdlTooltip forId={DASHBOARD_IDS.filter}>
        {DASHBOARD_MESSAGES.filterTooltip}
      </MdlTooltip>
    </div>
  );
}
