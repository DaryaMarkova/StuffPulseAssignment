import {
  KeyboardKey,
  PERFORMANCE_CHIP_CLASS,
} from '@/shared/config';
import { getDepthClass, getPerformanceLevel } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import { NODE_UI_MESSAGES } from '../constants';
import type { TreeItemProps } from '../types';

/**
 * Элемент строки орг-дерева.
 *
 * @param {TreeItemProps} props - узел, состояние и колбэки
 * @returns {JSX.Element} разметка treeitem
 */
export function TreeItem({
  node,
  depth,
  hasChildren,
  expanded,
  selected,
  highlighted,
  onToggle,
  onSelect,
}: TreeItemProps) {
  const level = getPerformanceLevel(node.performance);
  const itemId = `tree-item-${node.id}`;
  const toggleId = `tree-toggle-${node.id}`;
  const nameId = `tree-name-${node.id}`;
  const headcountId = `tree-hc-${node.id}`;
  const perfId = `tree-perf-${node.id}`;
  const toggleLabel = expanded
    ? NODE_UI_MESSAGES.collapse
    : NODE_UI_MESSAGES.expand;
  const className = [
    'mdl-list__item',
    'app-tree-item',
    getDepthClass('app-tree-item', depth),
    selected ? 'is-selected mdl-color--yellow-50' : '',
    highlighted ? 'pulse-flash' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={itemId}
      className={className}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selected}
      aria-level={depth + 1}
      data-node-id={node.id}
      tabIndex={-1}
      onClick={onSelect}
      onKeyDown={(event) => {

        if (
          event.key === KeyboardKey.Enter ||
          event.key === KeyboardKey.Space
        ) {
          event.preventDefault();
          onSelect();
        }

      }}
    >
      {hasChildren ? (
        <>
          <button
            id={toggleId}
            type="button"
            className="mdl-button mdl-js-button mdl-button--icon app-tree-item__toggle"
            aria-label={toggleLabel}
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            <i className="material-icons" aria-hidden>
              {expanded
                ? NODE_UI_MESSAGES.expandIcon
                : NODE_UI_MESSAGES.collapseIcon}
            </i>
          </button>
          <MdlTooltip forId={toggleId}>{toggleLabel}</MdlTooltip>
        </>
      ) : (
        <span className="app-tree-item__spacer" aria-hidden />
      )}

      <span
        id={nameId}
        className="mdl-list__item-primary-content app-tree-item__name"
      >
        {node.name}
      </span>

      <MdlTooltip forId={nameId}>{node.name}</MdlTooltip>

      <span id={headcountId} className="mdl-chip mdl-color--grey-300">
        <span className="mdl-chip__text">{node.headcount}</span>
      </span>
      <MdlTooltip forId={headcountId}>
        {NODE_UI_MESSAGES.headcount(node.headcount)}
      </MdlTooltip>

      <span
        id={perfId}
        className={`mdl-chip ${PERFORMANCE_CHIP_CLASS[level]}`}
        aria-label={NODE_UI_MESSAGES.performanceAria(node.performance)}
      >
        <span className="mdl-chip__text">{node.performance}</span>
      </span>
      <MdlTooltip forId={perfId}>
        {NODE_UI_MESSAGES.performance(node.performance)}
      </MdlTooltip>

      <MdlTooltip forId={itemId}>
        {selected
          ? NODE_UI_MESSAGES.selected(node.name)
          : NODE_UI_MESSAGES.select(node.name)}
      </MdlTooltip>
    </div>
  );
}
