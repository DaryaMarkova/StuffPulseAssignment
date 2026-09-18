import { useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader, SplitView, Table, Tree } from '@/widgets';
import { buildTree, collectSubtreeIds, upgradeMdlElement } from '@/shared/lib';
import { MdlTooltip } from '@/shared/ui';
import { DASHBOARD_IDS, DASHBOARD_MESSAGES } from '../constants';
import { useDashboard } from '../utils/useDashboard';
import { useFilterNodes } from '../utils/useFilterNodes';
import { Filter } from './filter';

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
    flashCells,
  } = useDashboard();

  const {
    filterQuery,
    setFilterQuery,
    filteredNodes,
    filterEmpty,
    searchMode,
  } = useFilterNodes(nodes);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const spinnerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  const scopeIds = useMemo(() => {

    if (!selectedId) {
      return null;
    }

    return collectSubtreeIds(buildTree(filteredNodes), selectedId);
  }, [filteredNodes, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const stillVisible = filteredNodes.some((node) => node.id === selectedId);

    if (!stillVisible) {
      setSelectedId(null);
    }

  }, [filteredNodes, selectedId]);

  useEffect(() => {
    upgradeMdlElement(layoutRef.current);
  }, []);

  useEffect(() => {

    if (isLoading) {
      upgradeMdlElement(spinnerRef.current);
    }

  }, [isLoading]);

  const errorMessage =
    error instanceof Error ? error.message : DASHBOARD_MESSAGES.loadFailed;

  return (
    <div
      ref={layoutRef}
      className="mdl-layout mdl-js-layout app-shell mdl-color--grey-100"
    >
      <AppHeader status={status} />

      {isLoading ? (
        <div
          id={DASHBOARD_IDS.loading}
          className="app-state mdl-color-text--grey-600"
        >
          <div
            ref={spinnerRef}
            className="mdl-spinner mdl-js-spinner is-active"
            aria-hidden
          />
          
          <span>{DASHBOARD_MESSAGES.loading}</span>

          <MdlTooltip forId={DASHBOARD_IDS.loading}>
            {DASHBOARD_MESSAGES.loadingTooltip}
          </MdlTooltip>
        </div>
      ) : null}

      {isError ? (
        <div
          id={DASHBOARD_IDS.error}
          className="mdl-card mdl-shadow--2dp app-alert mdl-color--red-700 mdl-color-text--white"
          role="alert"
        >
          <div className="mdl-card__supporting-text mdl-color-text--white">
            {errorMessage}
          </div>
          <MdlTooltip forId={DASHBOARD_IDS.error}>{errorMessage}</MdlTooltip>
        </div>
      ) : null}

      {isFetched && !isError && nodes.length === 0 ? (
        <div
          id={DASHBOARD_IDS.empty}
          className="mdl-card mdl-shadow--2dp app-alert mdl-color--yellow-100"
        >
          <div className="mdl-card__supporting-text mdl-color-text--grey-900">
            {DASHBOARD_MESSAGES.empty}
          </div>
          <MdlTooltip forId={DASHBOARD_IDS.empty}>
            {DASHBOARD_MESSAGES.emptyTooltip}
          </MdlTooltip>
        </div>
      ) : null }

      {nodes.length > 0 ? (
        <main className="mdl-layout__content app-shell__content">
          <div className="app-shell__toolbar">
            <Filter
              value={filterQuery}
              onChange={setFilterQuery}
              searchMode={searchMode}
            />
          </div>

          {filterEmpty ? (
            <p className="mdl-color-text--grey-600 app-empty app-shell__filter-empty">
              {DASHBOARD_MESSAGES.filterEmpty}
            </p>
          ) : (
            <SplitView
              left={
                <Tree
                  key="org-tree-v2"
                  nodes={filteredNodes}
                  selectedId={selectedId}
                  flashIds={flashIds}
                  flashCells={flashCells}
                  onSelect={setSelectedId}
                />
              }
              right={
                <Table
                  nodes={filteredNodes}
                  scopeIds={scopeIds}
                  selectedId={selectedId}
                  flashCells={flashCells}
                  onSelect={setSelectedId}
                />
              }
            />
          )}
        </main>
      ) : null}
    </div>
  );
}
