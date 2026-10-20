import startCase from 'lodash/startCase';
import { LoadState } from 'app/api/schema.d';
import type { LoadDetailsFragment, PeopleQuery } from 'app/api/operations';
import { placesOf } from 'app/features/board/places';
import { checkOf } from 'app/features/today/today';

type Edges = NonNullable<NonNullable<PeopleQuery['memberships']>['edges']>;
export type Person = NonNullable<NonNullable<Edges[number]>['node']>;

/** The people of the query, in the order the API gives them */
export function peopleOf(data?: PeopleQuery | null): Person[] {
  return (data?.memberships?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is Person => !!node);
}

export type Readiness = 'ready' | 'expiring' | 'blocked';

type Rule = Person['eligibility']['rules'][number];

/** Whether a person can fly, in one word, and the rule that says so when they cannot or soon will not */
export type Summary = { status: Readiness; rule: Rule | null };

/**
 * What the rules say about a person, on no load in particular: blocked when one fails (or the server says they are not
 * ready), expiring when one runs out soon, else ready. The rule is the first that fails, or the first that runs out.
 */
export function summaryOf(eligibility: Pick<Person['eligibility'], 'ready' | 'rules'>): Summary {
  const rules = eligibility.rules ?? [];
  const failing = rules.find((rule) => checkOf(rule) === 'blocked');
  if (failing || !eligibility.ready) return { status: 'blocked', rule: failing ?? null };
  const expiring = rules.find((rule) => checkOf(rule) === 'expiring');
  return expiring ? { status: 'expiring', rule: expiring } : { status: 'ready', rule: null };
}

/** The name a person goes by: their nickname, else their name */
export const nameOf = (person: Pick<Person, 'user'>): string =>
  person.user.nickname || person.user.name || '';

/** "fun_jumper" → "Fun Jumper": the name of a role as the role pickers show it */
export const roleLabel = (name?: string | null): string => startCase(name ?? '');

export type StatusFilter = 'all' | Readiness;
export type PeopleFilter = {
  /** The id of a role, or every role */
  roleId: string | null;
  status: StatusFilter;
};
export const NO_FILTER: PeopleFilter = { roleId: null, status: 'all' };

/** The people the filters let through: one role, and one of ready, expiring or blocked */
export function filterPeople<P extends Person>(people: readonly P[], filter: PeopleFilter): P[] {
  return people.filter(
    (person) =>
      (!filter.roleId || person.role?.id === filter.roleId) &&
      (filter.status === 'all' || summaryOf(person.eligibility).status === filter.status)
  );
}

export type PeopleSort = 'name' | 'status' | 'credit' | 'lastLoad';
export const SORTS: PeopleSort[] = ['name', 'status', 'credit', 'lastLoad'];

const STATUS_RANK: Record<Readiness, number> = { blocked: 0, expiring: 1, ready: 2 };
const byName = (a: Person, b: Person) =>
  nameOf(a).localeCompare(nameOf(b), 'en', { sensitivity: 'base' });
const lastDate = (person: Person) => person.lastSlot?.load?.loadDate ?? '';

/**
 * The people in the order chosen: by name; who needs something first (blocked, then expiring); the least credit first;
 * or who flew last first (who never flew at the end). Ties go by name.
 */
export function sortPeople<P extends Person>(people: readonly P[], sort: PeopleSort): P[] {
  const compare = (a: P, b: P): number => {
    switch (sort) {
      case 'status':
        return (
          STATUS_RANK[summaryOf(a.eligibility).status] -
          STATUS_RANK[summaryOf(b.eligibility).status]
        );
      case 'credit':
        return (a.creditsCents ?? 0) - (b.creditsCents ?? 0);
      case 'lastLoad':
        // ISO dates sort as text; "" (never flew) after every date
        return lastDate(b).localeCompare(lastDate(a));
      default:
        return 0;
    }
  };
  return [...people].sort((a, b) => compare(a, b) || byName(a, b));
}

/** The roles to filter by, by name: the operator's, and any other a person loaded has (when those could not be read) */
export function roleOptions(
  roles: readonly { id: string; name?: string | null }[] | null | undefined,
  people: readonly Person[]
): { id: string; label: string }[] {
  const source: readonly { id: string; name?: string | null }[] = [
    ...(roles ?? []),
    ...people
      .map((person) => person.role)
      .filter((role): role is NonNullable<Person['role']> => !!role),
  ];
  const unique = new Map<string, string>(
    source.map((role): [string, string] => [role.id, roleLabel(role.name)])
  );
  return [...unique.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

type TargetLoad = Pick<
  LoadDetailsFragment,
  'id' | 'loadNumber' | 'state' | 'vehicles' | 'crew' | 'maxSlots' | 'occupiedSlots'
>;
export type ManifestTarget<L extends TargetLoad> = { load: L; free: number };

/** The loads a person can be put on: the open ones and the one on call, by number, with their free places */
export function manifestTargets<L extends TargetLoad>(
  loads: readonly (L | null | undefined)[]
): ManifestTarget<L>[] {
  return loads
    .filter((load): load is L => !!load)
    .filter((load) => load.state === LoadState.Open || load.state === LoadState.Boarding)
    .sort((a, b) => a.loadNumber - b.loadNumber)
    .map((load) => {
      const { capacity, filled } = placesOf(load);
      return { load, free: Math.max(0, capacity - filled) };
    });
}

type KeyTarget = { tagName?: string; isContentEditable?: boolean } | null;

/**
 * Whether a key press is the "/" that moves to the search box (the web): no modifier, and not typed into a field, where
 * it is a slash.
 */
export function isSearchShortcut(event: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  target?: unknown;
}): boolean {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return false;
  const target = event.target as KeyTarget;
  const tag = target?.tagName?.toUpperCase();
  return !(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable);
}

/** When a person last flew, for a column: today, on a date (`yyyy-MM-dd` at the operator), or never */
export function lastLoadOf(
  person: Pick<Person, 'lastSlot'>,
  today: string
): { when: 'today' | 'date' | 'never'; date: string | null } {
  const date = person.lastSlot?.load?.loadDate ?? null;
  if (!date) return { when: 'never', date: null };
  return { when: date === today ? 'today' : 'date', date };
}
