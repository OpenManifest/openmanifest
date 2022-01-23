import startOfDay from 'date-fns/startOfDay';
import addDays from 'date-fns/addDays';
import { LoadState } from '../../../api/schema.d';
import { QueryDropzoneDocument } from '../../../api/reflection';
import { QueryDropzoneQuery, QueryDropzoneQueryVariables } from '../../../api/operations';
import createMock from './createMockedQuery.mock';

export default createMock<QueryDropzoneQueryVariables, QueryDropzoneQuery>(
  QueryDropzoneDocument,
  {
    dropzoneId: 1,
    earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
  },
  {
    dropzone: {
      __typename: 'Dropzone',
      id: '1',
      lat: -10.24124,
      lng: 54.123123,
      banner: null,
      name: 'Skydive Jest',
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
      isPublic: false,
      requestPublication: false,
      isCreditSystemEnabled: true,
      federation: {
        id: '1',
        name: 'apf',
        slug: 'apf',
      },
      planes: [
        { id: '1', name: 'C182', registration: 'ABC-123' },
        { id: '2', name: 'Caravan', registration: 'CDE-456' },
      ],
      ticketTypes: [
        {
          id: '1',
          name: 'Height',
          cost: 123,
          extras: [],
          allowManifestingSelf: true,
          altitude: 14000,
          isTandem: false,
        },
        {
          id: '2',
          name: 'Tandem',
          extras: [],
          cost: 199,
          allowManifestingSelf: false,
          altitude: 14000,
          isTandem: true,
        },
        {
          id: '3',
          name: 'Hop n Pop',
          cost: 10,
          allowManifestingSelf: true,
          altitude: 4000,
          extras: [],
          isTandem: false,
        },
      ],
      currentConditions: {
        id: '1',
        jumpRun: 90,
        temperature: -1,
        offsetDirection: null,
        offsetMiles: null,
        createdAt: new Date().getTime(),
        exitSpotMiles: null,
        winds: [],
      },

      currentUser: {
        id: '123',
        license: {
          id: '1',
          name: 'Certifiate D',
        },
        credits: 100,
        hasCredits: true,
        hasExitWeight: true,
        hasMembership: true,
        hasReserveInDate: true,
        hasRigInspection: true,
        hasLicense: true,
        permissions: [],
        expiresAt: null,
        orders: {
          edges: [],
        },

        role: {
          id: '1',
          dropzoneId: 1,
          name: 'fun_jumper',
        },

        rigInspections: [],
        availableRigs: [],

        user: {
          id: '234',
          name: 'Court Jester',
          exitWeight: '100',
          email: 'jest@test.com',
          phone: '123456789',
          pushToken: null,
          image: null,

          rigs: [
            {
              id: '1',
              isPublic: true,
              name: 'Primary',
              packingCard: null,
              make: 'Vector',
              model: 'V310',
              serial: '12345',
              canopySize: 150,
              repackExpiresAt: addDays(new Date(), 20).getTime() / 1000,
              user: {
                id: '1',
              },
            },
            {
              id: '2',
              name: 'Pond',
              make: 'Mirage',
              isPublic: true,
              packingCard: null,
              model: 'G4.1',
              serial: '34567',
              canopySize: 170,
              repackExpiresAt: startOfDay(new Date()).getTime() / 1000,
              user: {
                id: '1',
              },
            },
          ],
        },
      },
      loads: {
        edges: [
          {
            node: {
              id: '1',
              name: null,
              state: LoadState.Open,
              loadNumber: 1,
              isOpen: false,
              maxSlots: 4,
            },
          },
          {
            node: {
              id: '2',
              name: 'Sunset load',
              loadNumber: 2,
              state: LoadState.Open,
              isOpen: true,
              maxSlots: 16,
            },
          },
        ],
      },
    },
  }
);
