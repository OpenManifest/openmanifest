import { LoadState } from 'app/api/schema.d';
import type { LoadDetailsFragment } from 'app/api/operations';
import { placesOf } from 'app/features/board/places';

type BookableLoad = Pick<
  LoadDetailsFragment,
  'id' | 'state' | 'slots' | 'vehicles' | 'crew' | 'maxSlots' | 'occupiedSlots'
>;

/** A member can book themselves on a load that has not left, has a free place and does not have them yet */
export function canBook(load: BookableLoad, membershipId?: string | null): boolean {
  if (!membershipId) return false;
  if (load.state !== LoadState.Open && load.state !== LoadState.Boarding) return false;
  const { capacity, filled } = placesOf(load);
  if (filled >= capacity) return false;
  return !(load.slots ?? []).some((slot) => slot.membership?.id === membershipId);
}

/** The load a "Book a jump" on Today books: the first of the day that the member can still get on */
export function firstBookable<L extends BookableLoad>(
  loads: readonly L[],
  membershipId?: string | null
): L | null {
  return loads.find((load) => canBook(load, membershipId)) ?? null;
}
