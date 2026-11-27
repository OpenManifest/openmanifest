import { SlotDetailsFragment } from 'app/api/operations';

export const slotLoadingFragment: SlotDetailsFragment = {
  id: '__LOADING__',
  lockVersion: 0,
  costCents: 0,
  createdAt: new Date().toISOString(),
  bodyMassKg: 0,
  prepaid: false,
  groupNumber: 0,
  membership: null,
  equipment: [],
  extras: null,
  activityType: null,
  guestSlots: [],
  __typename: 'Slot',
  ticketType: null,
  wingLoading: null,
};

export const slotAvailableFragment: SlotDetailsFragment = {
  ...slotLoadingFragment,
  id: '__AVAILABLE__',
};
