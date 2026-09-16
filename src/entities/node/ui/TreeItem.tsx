import { getPerformanceLevel } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import type { TreeItemProps } from '../types';

const PERF_CHIP: Record<'low' | 'mid' | 'high', string> = {
  low: 'mdl-color--red-100 mdl-color-text--red-900',
  mid: 'mdl-color--amber-100 mdl-color-text--amber-900',
  high: 'mdl-color--deep-orange-100 mdl-color-text--deep-orange-900',
};

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
  const toggleLabel = expanded ? 'Collapse' : 'Expand';
  const className = [
    'mdl-list__item app-tree-item',
    selected ? 'is-selected mdl-color--deep-orange-50' : '',
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
      style={{ paddingLeft: `${8 + Math.min(depth, 6) * 16}px` }}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
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
              {expanded ? 'expand_more' : 'chevron_right'}
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
        Headcount: {node.headcount}
      </MdlTooltip>

      <span
        id={perfId}
        className={`mdl-chip ${PERF_CHIP[level]}`}
        aria-label={`Performance ${node.performance}`}
      >
        <span className="mdl-chip__text">{node.performance}</span>
      </span>
      <MdlTooltip forId={perfId}>
        Performance: {node.performance}
      </MdlTooltip>

      <MdlTooltip forId={itemId}>
        {selected ? `Selected: ${node.name}` : `Select ${node.name}`}
      </MdlTooltip>
    </div>
  );
}
