import { TicketTypeEssentialsFragment } from 'app/api/operations';

export const ticketTypeEssentials: Required<TicketTypeEssentialsFragment> = {
  __typename: 'TicketType',
  id: '1',
  name: 'Height',
  cost: 123,
  extras: [],
  allowManifestingSelf: true,
  altitude: 14000,
  isTandem: false,
};
