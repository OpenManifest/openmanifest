import type { MemberPickerQuery } from 'app/api/operations';

export type PickerMember = NonNullable<
  NonNullable<NonNullable<MemberPickerQuery['memberships']>['edges']>[number]
>['node'] &
  object;

export type PickerFilter = 'everyone' | 'ready' | 'today';

/** What a member flew last time, as the values a new slot starts from */
export type SlotDefaults = {
  ticketTypeId: string | null;
  activityTypeId: string | null;
  destinationId: string | null;
  equipmentIds: string[];
  extraIds: string[];
  bodyMassKg: number | null;
  /** What the slot costs in cents: the ticket and its extras */
  costCents: number;
};

/** The slot a member starts from: their last one, with their body mass from their profile when it had none */
export function defaultsOf(member: PickerMember | null | undefined): SlotDefaults {
  const last = member?.lastSlot;
  const profileMass = Number(member?.user?.bodyMassKg);
  const mass =
    last?.bodyMassKg || (Number.isFinite(profileMass) && profileMass > 0 ? profileMass : null);

  return {
    ticketTypeId: last?.ticketType?.id ?? null,
    activityTypeId: last?.activityType?.id ?? null,
    destinationId: last?.destination?.id ?? null,
    equipmentIds: (last?.equipment ?? []).map(({ id }) => id),
    extraIds: (last?.extras ?? []).map(({ id }) => id),
    bodyMassKg: mass,
    costCents: last?.ticketType?.costCents ?? 0,
  };
}

/** A new member, or one whose last slot is gone, has nothing to start from: they choose a ticket and a type of their own */
export function hasDefaults(defaults: SlotDefaults): boolean {
  return !!defaults.ticketTypeId && !!defaults.activityTypeId;
}

/** The members the filter lets through (the server's eligibility for the load, or the day they last flew) */
export function filterMembers<T extends PickerMember>(
  members: readonly T[],
  filter: PickerFilter,
  today: string
): T[] {
  switch (filter) {
    case 'ready':
      return members.filter((member) => member.eligibility.ready);
    case 'today':
      return members.filter((member) => member.lastSlot?.load?.loadDate === today);
    default:
      return [...members];
  }
}

/** Ready members first (stable otherwise), so the people who can be added are at the top of an unfiltered list */
export function sortReadyFirst<T extends PickerMember>(members: readonly T[]): T[] {
  return [...members].sort((a, b) => Number(b.eligibility.ready) - Number(a.eligibility.ready));
}

/**
 * What the wallet will look like after the slot: `{ price, left }` in cents, and whether it goes below zero. A prepaid
 * slot (or a free one) takes nothing.
 */
export function creditAfter(creditsCents: number | null | undefined, costCents: number) {
  const credits = creditsCents ?? 0;
  return {
    price: costCents,
    left: credits - costCents,
    negative: credits - costCents < 0 && costCents > 0,
  };
}
