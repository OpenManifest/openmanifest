import { LoadState } from 'app/api/schema.d';

type Orderable = { id: string; state?: LoadState | string | null; loadNumber?: number | null };

/** The board reads top to bottom: what is still to fly, then what is in the air, then what is over */
const STATE_RANK: Record<string, number> = {
  [LoadState.Open]: 0,
  [LoadState.Boarding]: 1,
  [LoadState.Departed]: 2,
  [LoadState.Completed]: 3,
  [LoadState.Cancelled]: 3,
};

/** Loads by state (open → boarding → departed → completed/cancelled), then by load number */
export function sortLoads<T extends Orderable>(loads: readonly T[]): T[] {
  return [...loads].sort(
    (a, b) =>
      (STATE_RANK[a.state ?? ''] ?? 4) - (STATE_RANK[b.state ?? ''] ?? 4) ||
      (a.loadNumber ?? 0) - (b.loadNumber ?? 0) ||
      a.id.localeCompare(b.id, undefined, { numeric: true })
  );
}

/**
 * Loads in the order they were frozen in. A load that came after the freeze goes last (in the usual order) and one that
 * left is dropped, so nothing moves under the user's finger but the board is never stale.
 */
export function holdOrder<T extends Orderable>(
  loads: readonly T[],
  frozen: readonly string[]
): T[] {
  const byId = new Map(loads.map((load) => [load.id, load]));
  const held = frozen.map((id) => byId.get(id)).filter((load): load is T => !!load);
  const heldIds = new Set(held.map((load) => load.id));
  return [...held, ...sortLoads(loads.filter((load) => !heldIds.has(load.id)))];
}
