import type { GuestEssentialsFragment } from 'app/api/operations';
import type { GuestInput } from 'app/api/schema.d';

/** A guest being booked with an escort: what the manifest forms hold until they are sent */
export type GuestValue = {
  name: string;
  bodyMassKg: number | null;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  emergencyContact?: string | null;
};

export const EMPTY_GUEST: GuestValue = { name: '', bodyMassKg: null };

/** The guests of a slot being edited, as the forms hold them */
export function guestValuesOf(
  guestSlots?: Array<{
    bodyMassKg: number;
    guest?: Partial<GuestEssentialsFragment> | null;
  }> | null
): GuestValue[] {
  return (guestSlots ?? []).map(({ bodyMassKg, guest }) => ({
    name: guest?.name ?? '',
    bodyMassKg: guest?.bodyMassKg ?? (bodyMassKg || null),
    email: guest?.email,
    phone: guest?.phone,
    dateOfBirth: guest?.dateOfBirth,
    emergencyContact: guest?.emergencyContact,
  }));
}

/** What the API takes: empty text fields are left out */
export function guestInputsOf(guests?: GuestValue[] | null): GuestInput[] {
  return (guests ?? []).map(
    ({ name, bodyMassKg, email, phone, dateOfBirth, emergencyContact }) => ({
      name,
      bodyMassKg: bodyMassKg ?? undefined,
      email: email || undefined,
      phone: phone || undefined,
      dateOfBirth: dateOfBirth || undefined,
      emergencyContact: emergencyContact || undefined,
    })
  );
}

/** The first thing wrong with the guests, or null: each needs a name and an exit weight; at most `capacity` */
export function guestsError(
  guests: GuestValue[] | null | undefined,
  capacity: number
): string | null {
  const list = guests ?? [];
  if (list.length > capacity) return `Up to ${capacity} for each escort`;
  if (list.some(({ name }) => !name?.trim())) return 'Every guest needs a name';
  if (list.some(({ bodyMassKg }) => !bodyMassKg)) return 'Every guest needs an exit weight';
  return null;
}
