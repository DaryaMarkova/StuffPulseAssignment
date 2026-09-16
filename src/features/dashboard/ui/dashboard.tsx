import { useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader, SplitView, Table, Tree } from '@/widgets';
import { buildTree, collectSubtreeIds, upgradeMdlElement } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import { useDashboard } from '../utils/useDashboard';

const LOADING_ID = 'dashboard-loading';
const ERROR_ID = 'dashboard-error';
const EMPTY_ID = 'dashboard-empty';

/**
 * Главный экран: дерево, таблица, статус SSE и подсветка патчей.
 *
 * @returns {JSX.Element} разметка дашборда
 */
export function Dashboard() {
  const {
    nodes,
    isLoading,
    isError,
    error,
    isFetched,
    status,
    flashIds,
  } = useDashboard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  const scopeIds = useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return collectSubtreeIds(buildTree(nodes), selectedId);
  }, [nodes, selectedId]);

  useEffect(() => {
    upgradeMdlElement(layoutRef.current);
  }, []);

  useEffect(() => {
    if (isLoading) {
      upgradeMdlElement(spinnerRef.current);
    }
  }, [isLoading]);

  const errorMessage =
    error instanceof Error ? error.message : 'Failed to load nodes';

  return (
    <div
      ref={layoutRef}
      className="mdl-layout mdl-js-layout mdl-layout--fixed-header app-shell mdl-color--grey-100"
    >
      <AppHeader status={status} />

      {isLoading ? (
        <div id={LOADING_ID} className="app-state mdl-color-text--grey-600">
          <div
            ref={spinnerRef}
            className="mdl-spinner mdl-js-spinner is-active"
            aria-hidden
          />
          <span>Loading organization…</span>
          <MdlTooltip forId={LOADING_ID}>
            Loading organization data
          </MdlTooltip>
        </div>
      ) : null}

      {isError ? (
        <div
          id={ERROR_ID}
          className="mdl-card mdl-shadow--2dp app-alert mdl-color--red-700 mdl-color-text--white"
          role="alert"
        >
          <div className="mdl-card__supporting-text mdl-color-text--white">
            {errorMessage}
          </div>
          <MdlTooltip forId={ERROR_ID}>{errorMessage}</MdlTooltip>
        </div>
      ) : null}

      {isFetched && !isError && nodes.length === 0 ? (
        <div
          id={EMPTY_ID}
          className="mdl-card mdl-shadow--2dp app-alert mdl-color--light-blue-100"
        >
          <div className="mdl-card__supporting-text mdl-color-text--blue-900">
            No nodes returned.
          </div>
          <MdlTooltip forId={EMPTY_ID}>
            The server returned an empty organization
          </MdlTooltip>
        </div>
      ) : null}

      {nodes.length > 0 ? (
        <main className="mdl-layout__content app-shell__content">
          <SplitView
            left={
              <Tree
                nodes={nodes}
                selectedId={selectedId}
                flashIds={flashIds}
                onSelect={setSelectedId}
              />
            }
            right={
              <Table
                nodes={nodes}
                scopeIds={scopeIds}
                selectedId={selectedId}
                flashIds={flashIds}
                onSelect={setSelectedId}
              />
            }
          />
        </main>
      ) : null}
    </div>
  );
}
