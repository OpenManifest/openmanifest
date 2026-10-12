import { fullAltitude, hopNPop } from 'app/__fixtures__/destination.fixture';
import { AllowedTicketTypesDocument } from 'app/api/reflection';
import { AllowedTicketTypesQueryVariables, AllowedTicketTypesQuery } from 'app/api/operations';
import createMock from './createMockedQuery.mock';

export default createMock<AllowedTicketTypesQueryVariables, AllowedTicketTypesQuery>(
  AllowedTicketTypesDocument,
  {
    operator: '1',
    onlyPublicTickets: true,
  },
  {
    __typename: 'Query',
    ticketTypes: [
      {
        __typename: 'TicketType',
        allowManifestingSelf: true,
        defaultDestination: fullAltitude,
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
        defaultDestination: hopNPop,
        isTandem: false,
        extras: [],
      },
    ],
  }
);
