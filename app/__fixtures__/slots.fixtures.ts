import { SlotDetailsFragment } from 'app/api/operations';

export const slotLoadingFragment: SlotDetailsFragment = {
  id: '__LOADING__',
  cost: 0,
  createdAt: 0,
  exitWeight: 0,
  groupNumber: 0,
  dropzoneUser: null,
  rig: null,
  extras: null,
  jumpType: null,
  passengerExitWeight: null,
  __typename: 'Slot',
  passengerName: null,
  ticketType: null,
  wingLoading: null,
};

export const slotAvailableFragment: SlotDetailsFragment = {
  ...slotLoadingFragment,
  id: '__AVAILABLE__',
};
