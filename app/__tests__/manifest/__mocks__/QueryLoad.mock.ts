import { fullAltitude, hopNPop } from 'app/__fixtures__/destination.fixture';
import { merge } from 'lodash';
import { LoadState, LoadVehicleRole } from '../../../api/schema.d';
import {
  MembershipDetailsFragment,
  MembershipEssentialsFragment,
  LoadEssentialsFragment,
  LoadQuery,
  LoadQueryVariables,
} from '../../../api/operations';
import { LoadDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export const loadEssentials: LoadEssentialsFragment = {
  __typename: 'Load',
  id: '1',
  lockVersion: 0,
  name: 'Test Load',
  createdAt: new Date().toISOString(),
  dispatchAt: null,
  hasCompleted: false,
  loadNumber: 1,
  isFull: false,
  state: LoadState.Open,
  isOpen: true,
  weight: 100,
  maxSlots: 10,
  availableSlots: 7,
  occupiedSlots: 3,
};

const membershipEssentials: MembershipEssentialsFragment = {
  __typename: 'Membership',
  id: '1',
  walletId: '1',
  user: {
    id: '1',
    name: 'jest',
  },
  hasCredits: true,
  hasBodyMassKg: true,
  hasMembership: true,
  hasCertificationLevel: false,
  certificationLevel: null,
  role: {
    id: '1',
    name: 'jest',
    operatorId: 1,
  },
  expiresAt: null,
};

const membershipDetails: MembershipDetailsFragment = merge({}, membershipEssentials, {
  __typename: 'Membership',
  id: '21',
  role: {
    id: '1',
    operatorId: 1,
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
    id: '21',
    name: 'Amy Hops',
    bodyMassKg: '100',
  },
  certificationLevel: {
    __typename: 'CertificationLevel',
    id: '21',
    name: 'Certificate A',
  },
});
const beaver = {
  __typename: 'Vehicle' as const,
  minCapacity: 0,
  registration: 'ABC123',
  id: '1',
  capacity: 10,
  name: 'Beaver',
  kind: 'aircraft',
};

export default createMockedQuery<LoadQueryVariables, LoadQuery>(
  LoadDocument,
  { id: '1' },
  {
    load: {
      ...loadEssentials,
      destinations: [],
      crew: [],
      vehicle: beaver,
      vehicles: [
        {
          __typename: 'LoadVehicle',
          id: '1',
          role: LoadVehicleRole.Carrying,
          position: 0,
          capacity: 10,
          slotsCount: 0,
          vehicle: beaver,
        },
      ],
      // Distinct ids: the Apollo cache normalises Membership by id, so sharing one with a slot would overwrite it.
      gca: merge({}, membershipEssentials, {
        id: '11',
        user: {
          id: '11',
          name: 'jest',
        },
      }),
      pilot: merge({}, membershipEssentials, {
        id: '12',
        user: {
          id: '12',
          name: 'Jess I. Canflie',
        },
      }),
      loadMaster: null,
      slots: [
        {
          equipment: [],
          __typename: 'Slot',
          lockVersion: 0,
          id: '1',
          costCents: 10000,
          createdAt: new Date().toISOString(),
          bodyMassKg: 100,
          guestName: null,
          guestBodyMassKg: null,
          wingLoading: 1.3,
          groupNumber: 0,
          membership: membershipDetails,
          ticketType: {
            allowManifestingSelf: true,
            __typename: 'TicketType',
            id: '1',
            costCents: 1000,
            name: 'Height',
            defaultDestination: fullAltitude,
            isTandem: false,

            extras: [],
          },

          activityType: {
            __typename: 'ActivityType',
            id: '1',
            name: 'Freefly',
          },
          extras: null,
        },
        {
          equipment: [],
          __typename: 'Slot',
          lockVersion: 0,
          id: '2',
          costCents: 10000,
          createdAt: new Date().toISOString(),
          bodyMassKg: 70,
          guestName: null,
          guestBodyMassKg: null,
          wingLoading: 1.3,
          groupNumber: 0,
          membership: merge({}, membershipDetails, {
            id: '2',
            user: {
              id: '2',
              name: 'Ali Falls',
              bodyMassKg: '100',
            },
            certificationLevel: {
              id: '21',
              name: 'Certificate A',
            },
          }),
          ticketType: {
            __typename: 'TicketType',
            id: '2',
            allowManifestingSelf: true,
            costCents: 1000,
            name: 'Hop n Pop',
            defaultDestination: hopNPop,
            isTandem: false,

            extras: [],
          },

          activityType: {
            __typename: 'ActivityType',
            id: '2',
            name: 'Hop n Pop',
          },
          extras: null,
        },
        {
          equipment: [],
          costCents: 10000,
          __typename: 'Slot',
          lockVersion: 0,
          id: '3',
          groupNumber: 0,
          createdAt: new Date().toISOString(),
          bodyMassKg: 100,
          guestName: null,
          guestBodyMassKg: null,

          wingLoading: 1.3,
          membership: merge({}, membershipDetails, {
            id: '3',
            user: {
              __typename: 'User',
              id: '3',
              name: 'John Stumble',
              bodyMassKg: '100',
            },
            certificationLevel: {
              id: '3',
              name: 'Certificate C',
            },
          }),
          ticketType: {
            __typename: 'TicketType',
            id: '3',
            costCents: 1000,
            allowManifestingSelf: true,
            name: 'Height',
            defaultDestination: fullAltitude,
            isTandem: false,
            extras: [{ id: '1', name: 'Outside camera', costCents: 12000 }],
          },

          activityType: {
            id: '3',

            name: 'Tandem',
          },
          extras: [{ id: '1', name: 'Outside camera', __typename: 'Extra' }],
        },
      ],
    },
  }
);
