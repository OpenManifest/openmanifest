import { LoadState } from '../../../api/schema.d';
import { LoadEssentialsFragment, LoadQuery, LoadQueryVariables } from '../../../api/operations';
import { LoadDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

const loadEssentials: LoadEssentialsFragment = {
  __typename: 'Load',
  id: '1',
  name: 'Test Load',
  createdAt: Math.floor(new Date().getTime() / 1000 - 30 * 60 * 60),
  dispatchAt: null,
  hasLanded: false,
  loadNumber: 1,
  isFull: false,
  state: LoadState.Open,
  isOpen: true,
  weight: 100,
  maxSlots: 10,
  availableSlots: 7,
  occupiedSlots: 3,
};
export default createMockedQuery<LoadQueryVariables, LoadQuery>(
  LoadDocument,
  { id: 1 },
  {
    load: {
      ...loadEssentials,

      plane: {
        __typename: 'Plane',
        id: '1',
        maxSlots: 10,
        name: 'Beaver',
      },
      gca: {
        __typename: 'DropzoneUser',
        id: '1',
        user: {
          id: '1',
          name: 'jest',
        },
      },
      pilot: {
        __typename: 'DropzoneUser',
        id: '2',
        user: {
          id: '2',
          name: 'Jess I. Canflie',
        },
      },
      loadMaster: null,
      slots: [
        {
          __typename: 'Slot',
          id: '1',
          createdAt: (new Date().getTime() - 120000) / 1000,
          exitWeight: 100,
          passengerName: null,
          passengerExitWeight: null,
          wingLoading: 1.3,
          groupNumber: 0,
          dropzoneUser: {
            __typename: 'DropzoneUser',
            id: '1',
            role: {
              id: '1',
              name: 'fun_jumper',
            },
            user: {
              __typename: 'User',
              apfNumber: null,
              email: null,
              image: null,
              moderationRole: null,
              nickname: null,
              phone: null,
              id: '1',
              name: 'Amy Hops',
              exitWeight: '100',
              license: {
                __typename: 'License',
                id: '1',
                name: 'Certificate A',
              },
            },
            license: {
              __typename: 'License',
              id: '1',
              name: 'Certificate A',
            },
          },
          ticketType: {
            __typename: 'TicketType',
            id: '1',
            cost: 10,
            name: 'Height',
            altitude: 14000,
            isTandem: false,

            extras: [],
          },

          jumpType: {
            __typename: 'JumpType',
            id: '1',
            name: 'Freefly',
          },
          extras: null,
        },
        {
          __typename: 'Slot',
          id: '2',
          createdAt: (new Date().getTime() - 180000) / 1000,
          exitWeight: 70,
          passengerName: null,
          passengerExitWeight: null,
          wingLoading: 1.3,
          groupNumber: 0,
          dropzoneUser: {
            __typename: 'DropzoneUser',
            id: '2',

            role: {
              id: '1',
              name: 'fun_jumper',
            },
            user: {
              __typename: 'User',
              id: '2',
              name: 'Ali Falls',
              exitWeight: '100',
              apfNumber: null,
              email: null,
              image: null,
              moderationRole: null,
              nickname: null,
              phone: null,
              license: {
                id: '1',
                name: 'Certificate A',
              },
            },
            license: {
              __typename: 'License',
              id: '1',
              name: 'Certificate A',
            },
          },
          ticketType: {
            __typename: 'TicketType',
            id: '2',
            cost: 10,
            name: 'Hop n Pop',
            altitude: 4000,
            isTandem: false,

            extras: [],
          },

          jumpType: {
            __typename: 'JumpType',
            id: '2',
            name: 'Hop n Pop',
          },
          extras: null,
        },
        {
          __typename: 'Slot',
          id: '3',
          groupNumber: 0,
          createdAt: (new Date().getTime() - 240000) / 1000,
          exitWeight: 100,
          passengerName: null,
          passengerExitWeight: null,

          wingLoading: 1.3,
          dropzoneUser: {
            __typename: 'DropzoneUser',
            id: '3',
            role: {
              __typename: 'UserRole',
              id: '1',
              name: 'fun_jumper',
            },
            user: {
              __typename: 'User',
              id: '3',
              name: 'John Stumble',
              exitWeight: '100',
              apfNumber: null,
              email: null,
              image: null,
              moderationRole: null,
              nickname: null,
              phone: null,
              license: {
                id: '3',
                name: 'Certificate C',
              },
            },
            license: {
              __typename: 'License',
              id: '3',
              name: 'Certificate C',
            },
          },
          ticketType: {
            __typename: 'TicketType',
            id: '3',
            cost: 10,
            name: 'Height',
            altitude: 14000,
            isTandem: false,
            extras: [{ id: '1', name: 'Outside camera', cost: 120 }],
          },

          jumpType: {
            id: '3',

            name: 'Tandem',
          },
          extras: [{ id: '1', name: 'Outside camera' }],
        },
      ],
    },
  }
);
