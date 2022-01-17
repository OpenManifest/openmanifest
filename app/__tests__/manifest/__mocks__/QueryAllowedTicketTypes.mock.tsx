// eslint-disable-next-line max-len
import { AllowedTicketTypesDocument } from 'app/api/reflection';
import { AllowedTicketTypesQueryVariables, AllowedTicketTypesQuery } from 'app/api/operations';
import createMock from './createMockedQuery.mock';

export default createMock<AllowedTicketTypesQueryVariables, AllowedTicketTypesQuery>(
  AllowedTicketTypesDocument,
  {
    dropzoneId: 1,
    onlyPublicTickets: true,
  },
  {
    dropzone: {
      id: '1',

      ticketTypes: [
        {
          id: '1',
          name: 'Height',
          cost: 45,
          isTandem: false,
          extras: [],
        },
        {
          id: '3',
          name: 'Hop n Pop',
          cost: 30,
          isTandem: false,
          extras: [],
        },
      ],
    },
  }
);
