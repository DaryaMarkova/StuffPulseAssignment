import { useEffect } from 'react';
import { TreeItem } from '@/entities/node';
import { TableColumnId } from '@/shared/config';
import { MdlTooltip } from '@/shared/ui';
import { TREE_MESSAGES, TREE_PANEL_ID } from '../constants';
import type { BranchProps, TreeProps } from '../types';
import { useTreeExpansion } from '../utils/useTreeExpansion';

/**
 * Рекурсивная ветка дерева.
 *
 * @param {BranchProps} props - узлы, состояние раскрытия и колбэки
 * @returns {JSX.Element} разметка ветки
 */
function Branch({
  nodes,
  expandedIds,
  selectedId,
  flashIds,
  flashCells,
  onToggle,
  onSelect,
  open,
}: BranchProps) {
  const className = open ? 'app-tree-branch is-open' : 'app-tree-branch';

  return (
    <div
      className={className}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <div className="app-tree-branch__inner">
        {nodes.map((node) => {
          const hasChildren = node.children.length > 0;
          const expanded = expandedIds.has(node.id);

          return (
            <div key={node.id}>
              <TreeItem
                node={node}
                depth={node.depth}
                hasChildren={hasChildren}
                expanded={expanded}
                selected={selectedId === node.id}
                highlighted={flashIds.has(node.id)}
                flashHeadcount={flashCells.has(
                  `${node.id}:${TableColumnId.Headcount}`,
                )}
                flashPerformance={flashCells.has(
                  `${node.id}:${TableColumnId.Performance}`,
                )}
                onToggle={() => onToggle(node.id)}
                onSelect={() => onSelect(node.id)}
              />
              {hasChildren ? (
                <Branch
                  nodes={node.children}
                  expandedIds={expandedIds}
                  selectedId={selectedId}
                  flashIds={flashIds}
                  flashCells={flashCells}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  open={expanded}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Виджет орг-дерева с раскрытием и выбором узла.
 *
 * @param {TreeProps} props - узлы, выбор, подсветка и колбэк
 * @returns {JSX.Element} карточка дерева
 */
export function Tree({
  nodes,
  selectedId,
  flashIds,
  flashCells,
  onSelect,
}: TreeProps) {
  const { roots, expandedIds, toggle } = useTreeExpansion(nodes, selectedId);

  useEffect(() => {

    if (!selectedId) {
      return;
    }

    const element = document.getElementById(`tree-item-${selectedId}`);
    element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId, expandedIds]);

  return (
    <section
      id={TREE_PANEL_ID}
      className="mdl-card mdl-shadow--2dp app-card"
      aria-label={TREE_MESSAGES.ariaLabel}
    >
      <MdlTooltip forId={TREE_PANEL_ID}>
        {TREE_MESSAGES.panelTooltip}
      </MdlTooltip>
      <div
        className="mdl-card__supporting-text mdl-color--white app-card__body app-card__body--flush"
        role="tree"
      >
        <div className="mdl-list">
          <Branch
            nodes={roots}
            expandedIds={expandedIds}
            selectedId={selectedId}
            flashIds={flashIds}
            flashCells={flashCells}
            onToggle={toggle}
            onSelect={onSelect}
            open
          />
        </div>
      </div>
    </section>
  );
}
