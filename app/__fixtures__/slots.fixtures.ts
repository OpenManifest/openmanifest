import { SlotDetailsFragment } from 'app/api/operations';

export const slotLoadingFragment: SlotDetailsFragment = {
  id: '__LOADING__',
  lockVersion: 0,
  costCents: 0,
  createdAt: new Date().toISOString(),
  bodyMassKg: 0,
  groupNumber: 0,
  membership: null,
  rig: null,
  extras: null,
  activityType: null,
  guestBodyMassKg: null,
  __typename: 'Slot',
  guestName: null,
  ticketType: null,
  wingLoading: null,
};

export const slotAvailableFragment: SlotDetailsFragment = {
  ...slotLoadingFragment,
  id: '__AVAILABLE__',
};
