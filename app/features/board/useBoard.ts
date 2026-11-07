import * as React from 'react';
import { useApolloClient } from '@apollo/client';
import { useManifestContext } from 'app/providers/manifest/context';
import { LoadUpdatedDocument } from 'app/api/reflection';
import type { LoadDetailsFragment, LoadUpdatedSubscription } from 'app/api/operations';
import { applyLoadUpdate } from 'app/api/crud/subscriptions/useLoadUpdatedSubscription';
import { holdOrder, sortLoads } from './order';

/** How long a row that changed stays flagged */
export const HIGHLIGHT_MS = 600;

/**
 * The loads of one day for the board, with what the board needs to feel live:
 * - a stable order (state, then load number), held while the user drags or edits (`freeze` / `unfreeze`)
 * - the ids of the loads that changed, flagged for `HIGHLIGHT_MS`
 * - an update subscription per load of the day, so rows change without a refetch
 *
 * The loads are the manifest's query for the day (`useManifest`), so the board shares the cache with the load screen.
 * `date` (`YYYY-MM-DD` at the operator, today by default) moves the manifest to that day.
 */
export function useBoard(date?: string) {
  const { manifest } = useManifestContext();
  const { loads: fetched, date: shownDate, setDate, loading, refreshing, refetch } = manifest;
  const client = useApolloClient();

  React.useEffect(() => {
    if (date && date !== shownDate) setDate(date);
  }, [date, shownDate, setDate]);

  const loads = React.useMemo(
    () => fetched.filter((load): load is LoadDetailsFragment => !!load),
    [fetched]
  );

  // The order, held while frozen. It belongs to the day it was taken on: another day starts from a clean board.
  const [held, setHeld] = React.useState<{ date: string; ids: string[] } | null>(null);
  const frozenOrder = held && held.date === shownDate ? held.ids : null;
  const loadsRef = React.useRef(loads);
  React.useEffect(() => {
    loadsRef.current = loads;
  }, [loads]);
  const freeze = React.useCallback(
    () => setHeld({ date: shownDate, ids: sortLoads(loadsRef.current).map((load) => load.id) }),
    [shownDate]
  );
  const unfreeze = React.useCallback(() => setHeld(null), []);
  const ordered = React.useMemo(
    () => (frozenOrder ? holdOrder(loads, frozenOrder) : sortLoads(loads)),
    [loads, frozenOrder]
  );

  // Rows that changed: Apollo hands out a new object for a load when something in it changed
  const [changed, setChanged] = React.useState<ReadonlySet<string>>(() => new Set());
  const seen = React.useRef<{ date: string; byId: Map<string, LoadDetailsFragment> } | null>(null);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
  React.useEffect(() => {
    const previous = seen.current;
    seen.current = { date: shownDate, byId: new Map(loads.map((load) => [load.id, load])) };
    // The first loads of a day are not changes
    if (!previous || previous.date !== shownDate) return;
    const flagged = loads
      .filter((load) => previous.byId.get(load.id) !== load)
      .map((load) => load.id);
    if (!flagged.length) return;

    setChanged((current) => new Set([...current, ...flagged]));
    flagged.forEach((id) => {
      clearTimeout(timers.current.get(id));
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id);
          setChanged((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
          });
        }, HIGHLIGHT_MS)
      );
    });
  }, [loads, shownDate]);
  React.useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    []
  );

  // One subscription per load of the day; the key keeps the effect from restarting when only a row changed
  const ids = loads.map((load) => load.id).join(',');
  React.useEffect(() => {
    if (!ids) return undefined;
    const subscriptions = ids.split(',').map((id) =>
      client
        .subscribe<LoadUpdatedSubscription>({ query: LoadUpdatedDocument, variables: { id } })
        .subscribe({
          next: ({ data }) => {
            if (data?.loadUpdated?.load?.id) applyLoadUpdate(client, data.loadUpdated.load);
          },
          // A dropped socket reconnects with the next focus; the cache still holds the last state
          error: () => undefined,
        })
    );
    return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, [client, ids]);

  return {
    date: shownDate,
    isToday: manifest.isToday,
    loads: ordered,
    changed,
    isChanged: React.useCallback((id: string) => changed.has(id), [changed]),
    frozen: frozenOrder !== null,
    freeze,
    unfreeze,
    loading,
    refreshing,
    refetch,
  };
}
