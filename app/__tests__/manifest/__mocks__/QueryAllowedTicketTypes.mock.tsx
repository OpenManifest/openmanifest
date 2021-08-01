// eslint-disable-next-line max-len
import { QUERY_DROPZONE_USERS_ALLOWED_TICKET_TYPES } from '../../../components/input/chip_select/TicketTypeChipSelect';
import { TicketType, Dropzone } from '../../../api/schema.d';

export const MOCK_QUERY_ALLOWED_TICKET_TYPES = {
  request: {
    query: QUERY_DROPZONE_USERS_ALLOWED_TICKET_TYPES,
    variables: {
      dropzoneId: 1,
      onlyPublicTickets: true,
    },
  },
  result: {
    data: {
      dropzone: {
        id: '1',

        ticketTypes: [
          {
            id: '1',
            name: 'Height',
            cost: 45,
            isTandem: false,
            extras: [],
            createdAt: new Date().getTime() / 1000,
            updatedAt: new Date().getTime() / 1000,
          } as TicketType,
          {
            id: '3',
            name: 'Hop n Pop',
            cost: 30,
            isTandem: false,
            extras: [],
            createdAt: new Date().getTime() / 1000,
            updatedAt: new Date().getTime() / 1000,
          } as TicketType,
        ],
      } as Dropzone,
    },
  },
};
