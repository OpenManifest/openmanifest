import { merge } from 'lodash';
import { LoadState } from '../../../api/schema.d';
import {
  DropzoneUserDetailsFragment,
  DropzoneUserEssentialsFragment,
  LoadEssentialsFragment,
  LoadQuery,
  LoadQueryVariables,
} from '../../../api/operations';
import { LoadDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

const loadEssentials: LoadEssentialsFragment = {
  __typename: 'Load',
  id: '1',
  name: 'Test Load',
  createdAt: new Date().toISOString(),
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

const dropzoneUserEssentials: DropzoneUserEssentialsFragment = {
  __typename: 'DropzoneUser',
  id: '1',
  user: {
    id: '1',
    name: 'jest',
  },
  hasCredits: true,
  hasExitWeight: true,
  hasMembership: true,
  hasLicense: false,
  license: null,
  role: {
    id: '1',
    name: 'jest',
    dropzoneId: 1,
  },
  expiresAt: null,
};

const dropzoneUserDetails: DropzoneUserDetailsFragment = merge(dropzoneUserEssentials, {
  __typename: 'DropzoneUser',
  id: '1',
  role: {
    id: '1',
    dropzoneId: 1,
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
  },
  license: {
    __typename: 'License',
    id: '1',
    name: 'Certificate A',
  },
});
export default createMockedQuery<LoadQueryVariables, LoadQuery>(
  LoadDocument,
  { id: '1' },
  {
    load: {
      ...loadEssentials,
      plane: {
        __typename: 'Plane',
        minSlots: 0,
        registration: 'ABC123',
        id: '1',
        maxSlots: 10,
        name: 'Beaver',
      },
      gca: merge(dropzoneUserEssentials, {
        id: '1',
        user: {
          id: '1',
          name: 'jest',
        },
      }),
      pilot: merge(dropzoneUserEssentials, {
        id: '2',
        user: {
          id: '2',
          name: 'Jess I. Canflie',
        },
      }),
      loadMaster: null,
      slots: [
        {
          rig: null,
          __typename: 'Slot',
          id: '1',
          cost: 100,
          createdAt: new Date().toISOString(),
          exitWeight: 100,
          passengerName: null,
          passengerExitWeight: null,
          wingLoading: 1.3,
          groupNumber: 0,
          dropzoneUser: dropzoneUserDetails,
          ticketType: {
            allowManifestingSelf: true,
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
          rig: null,
          __typename: 'Slot',
          id: '2',
          cost: 100,
          createdAt: new Date().toISOString(),
          exitWeight: 70,
          passengerName: null,
          passengerExitWeight: null,
          wingLoading: 1.3,
          groupNumber: 0,
          dropzoneUser: merge(dropzoneUserDetails, {
            id: '2',
            user: {
              id: '2',
              name: 'Ali Falls',
              exitWeight: '100',
            },
            license: {
              id: '1',
              name: 'Certificate A',
            },
          }),
          ticketType: {
            __typename: 'TicketType',
            id: '2',
            allowManifestingSelf: true,
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
          rig: null,
          cost: 100,
          __typename: 'Slot',
          id: '3',
          groupNumber: 0,
          createdAt: new Date().toISOString(),
          exitWeight: 100,
          passengerName: null,
          passengerExitWeight: null,

          wingLoading: 1.3,
          dropzoneUser: merge(dropzoneUserDetails, {
            id: '3',
            user: {
              __typename: 'User',
              id: '3',
              name: 'John Stumble',
              exitWeight: '100',
            },
            license: {
              id: '3',
              name: 'Certificate C',
            },
          }),
          ticketType: {
            __typename: 'TicketType',
            id: '3',
            cost: 10,
            allowManifestingSelf: true,
            name: 'Height',
            altitude: 14000,
            isTandem: false,
            extras: [{ id: '1', name: 'Outside camera', cost: 120 }],
          },

          jumpType: {
            id: '3',

            name: 'Tandem',
          },
          extras: [{ id: '1', name: 'Outside camera', __typename: 'Extra' }],
        },
      ],
    },
  }
);
