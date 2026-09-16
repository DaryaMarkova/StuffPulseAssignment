import { TreeItem } from '@/entities/node';
import { MdlTooltip } from '@/shared/ui';
import { useTreeExpansion } from '../model/useTreeExpansion';
import type { BranchProps, TreeProps } from '../types';

const TREE_PANEL_ID = 'org-tree-panel';

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
  onToggle,
  onSelect,
  open,
}: BranchProps) {
  return (
    <div className={open ? 'app-tree-branch is-open' : 'app-tree-branch'}>
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
                onToggle={() => onToggle(node.id)}
                onSelect={() => onSelect(node.id)}
              />
              {hasChildren ? (
                <Branch
                  nodes={node.children}
                  expandedIds={expandedIds}
                  selectedId={selectedId}
                  flashIds={flashIds}
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
export function Tree({ nodes, selectedId, flashIds, onSelect }: TreeProps) {
  const { roots, expandedIds, toggle } = useTreeExpansion(nodes);

  return (
    <section
      id={TREE_PANEL_ID}
      className="mdl-card mdl-shadow--2dp app-card"
      aria-label="Organization tree"
    >
      <MdlTooltip forId={TREE_PANEL_ID}>
        Organization tree — click a node to filter the table
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
            onToggle={toggle}
            onSelect={onSelect}
            open
          />
        </div>
      </div>
    </section>
  );
}
