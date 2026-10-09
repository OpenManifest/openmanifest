import { AllowedTicketTypesDocument } from 'app/api/reflection';
import { AllowedTicketTypesQueryVariables, AllowedTicketTypesQuery } from 'app/api/operations';
import createMock from './createMockedQuery.mock';

export default createMock<AllowedTicketTypesQueryVariables, AllowedTicketTypesQuery>(
  AllowedTicketTypesDocument,
  {
    dropzone: '1',
    onlyPublicTickets: true,
  },
  {
    __typename: 'Query',
    ticketTypes: [
      {
        __typename: 'TicketType',
        allowManifestingSelf: true,
        altitude: 14000,
        id: '1',
        name: 'Height',
        costCents: 4500,
        isTandem: false,
        extras: [],
      },
      {
        __typename: 'TicketType',
        id: '3',
        name: 'Hop n Pop',
        costCents: 3000,
        allowManifestingSelf: true,
        altitude: 4000,
        isTandem: false,
        extras: [],
      },
    ],
  }
);
