import { LoadState } from 'app/api/schema.d';
import type { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { isOver } from 'app/features/board/loadStatus';

type TodayLoad = Pick<LoadDetailsFragment, 'id' | 'loadNumber' | 'state' | 'slots' | 'crew'>;

/** Which comes first when someone is on several loads: the one that is about to go, then the one still open, then the one in the air */
const NEXT_RANK: Record<string, number> = {
  [LoadState.Boarding]: 0,
  [LoadState.Open]: 1,
  [LoadState.Departed]: 2,
};

/** The place the member has on a load (their own: a guest rides under an escort, and has no membership) */
export function placeOn(
  load: Pick<TodayLoad, 'slots'>,
  membershipId: string
): SlotDetailsFragment | null {
  return (load.slots ?? []).find((slot) => slot.membership?.id === membershipId) ?? null;
}

export type NextLoad<L extends TodayLoad> = { load: L; slot: SlotDetailsFragment };

/** The load the member flies next today: the one on call, or else the first open, or the one that is in the air */
export function nextLoadOf<L extends TodayLoad>(
  loads: readonly L[],
  membershipId: string
): NextLoad<L> | null {
  const mine = loads
    .filter((load) => load.state != null && load.state in NEXT_RANK)
    .map((load) => ({ load, slot: placeOn(load, membershipId) }))
    .filter((entry): entry is NextLoad<L> => !!entry.slot)
    .sort(
      (a, b) =>
        NEXT_RANK[a.load.state as string] - NEXT_RANK[b.load.state as string] ||
        a.load.loadNumber - b.load.loadNumber
    );
  return mine[0] ?? null;
}

export type Duty<L extends TodayLoad> = {
  key: string;
  load: L;
  /** The name of the crew role the member has on the load */
  role: string;
};

/** What the member is down to do for the day: each crew role they hold on a load that has not finished */
export function dutiesOf<L extends TodayLoad>(
  loads: readonly L[],
  membershipId: string
): Duty<L>[] {
  return loads
    .filter((load) => !isOver(load.state))
    .flatMap((load) =>
      (load.crew ?? [])
        .filter(({ membership }) => membership?.id === membershipId)
        .map(({ id, crewRole }) => ({ key: `${load.id}:${id}`, load, role: crewRole.name }))
    )
    .sort((a, b) => a.load.loadNumber - b.load.loadNumber);
}

/** The loads of the day in the order a member reads them: what is still to fly, then what is in the air, then what is over */
export function loadsOfDay<L extends TodayLoad>(loads: readonly L[]): L[] {
  const rank = (state?: string | null) =>
    state === LoadState.Open || state === LoadState.Boarding
      ? 0
      : state === LoadState.Departed
        ? 1
        : 2;
  return [...loads].sort((a, b) => rank(a.state) - rank(b.state) || a.loadNumber - b.loadNumber);
}

export type CheckStatus = 'ok' | 'expiring' | 'blocked';

type Rule = { code: string; ok: boolean; status?: string | null; bypassed?: boolean | null };

/** What a rule says about the member, for a row of the checklist */
export function checkOf(rule: Rule): CheckStatus {
  if (!rule.ok) return 'blocked';
  return rule.status === 'EXPIRING' ? 'expiring' : 'ok';
}

/** The rules the checklist shows, the ones that need something first: what is wrong or about to run out, then what is fine */
export function sortedChecks<R extends Rule>(rules: readonly R[]): R[] {
  const rank = { blocked: 0, expiring: 1, ok: 2 } as const;
  return [...rules].sort((a, b) => rank[checkOf(a)] - rank[checkOf(b)]);
}
