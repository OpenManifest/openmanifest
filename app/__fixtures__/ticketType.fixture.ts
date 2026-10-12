import { TicketTypeEssentialsFragment } from 'app/api/operations';
import { fullAltitude } from './destination.fixture';

export const ticketTypeEssentials: Required<TicketTypeEssentialsFragment> = {
  __typename: 'TicketType',
  id: '1',
  name: 'Height',
  costCents: 12300,
  allowManifestingSelf: true,
  defaultDestination: fullAltitude,
  isTandem: false,
  minCertificationRank: null,
  requiredQualification: null,
};
