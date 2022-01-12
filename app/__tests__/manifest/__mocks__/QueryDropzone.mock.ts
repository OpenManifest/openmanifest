import startOfDay from 'date-fns/startOfDay';
import addDays from 'date-fns/addDays';
import { Plane, LoadState } from '../../../api/schema.d';
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
      id: '1',
      lat: -10.24124,
      lng: 54.123123,
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
        { id: '1', name: 'C182', registration: 'ABC-123' } as Plane,
        { id: '2', name: 'Caravan', registration: 'CDE-456' } as Plane,
      ],
      ticketTypes: [
        { id: '1', name: 'Height' },
        { id: '2', name: 'Tandem' },
        { id: '3', name: 'Hop n Pop' },
      ],
      currentConditions: {
        id: '1',
        jumpRun: 90,
        temperature: -1,
        offsetDirection: null,
        offsetMiles: null,
        winds: [],
      },

      currentUser: {
        id: '123',
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

          jumpTypes: [
            { id: '1', name: 'Freefly' },
            { id: '2', name: 'Angle/Tracking' },
          ],
          license: { id: '1', name: 'Certificate C' },
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
