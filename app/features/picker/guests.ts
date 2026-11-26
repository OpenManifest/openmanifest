import type { GuestInput } from 'app/api/schema.d';

/** A guest being booked with an escort, as the picker holds them until they are sent */
export type GuestValue = { name: string; bodyMassKg: number | null; dateOfBirth: string };

export const emptyGuest = (): GuestValue => ({ name: '', bodyMassKg: null, dateOfBirth: '' });

/** What the API takes: a date of birth only when there is one */
export function guestInputs(guests: readonly GuestValue[]): GuestInput[] {
  return guests.map(({ name, bodyMassKg, dateOfBirth }) => ({
    name: name.trim(),
    bodyMassKg: bodyMassKg ?? undefined,
    dateOfBirth: dateOfBirth.trim() || undefined,
  }));
}

/** Whether the ticket's limits ask for the age of those who take it (the server then needs a date of birth) */
export function needsDateOfBirth(limits: unknown): boolean {
  if (!limits || typeof limits !== 'object') return false;
  return ['min_age', 'max_age'].some((key) => key in (limits as Record<string, unknown>));
}

export type GuestProblem = 'count' | 'name' | 'mass' | 'dob' | null;

/** The first thing missing from the guests, or null: at least one, at most `capacity`, each with a name and a mass */
export function guestProblem(
  guests: readonly GuestValue[],
  capacity: number,
  dateOfBirthNeeded: boolean
): GuestProblem {
  if (!guests.length || guests.length > capacity) return 'count';
  if (guests.some(({ name }) => !name.trim())) return 'name';
  if (guests.some(({ bodyMassKg }) => !bodyMassKg)) return 'mass';
  if (
    dateOfBirthNeeded &&
    guests.some(({ dateOfBirth }) => !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim()))
  )
    return 'dob';
  return null;
}
