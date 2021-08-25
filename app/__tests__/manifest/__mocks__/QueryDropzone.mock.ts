import startOfDay from 'date-fns/startOfDay';
import addDays from 'date-fns/addDays';
import { TicketType, Plane, Dropzone, DropzoneUser, LoadState } from '../../../api/schema.d';
import { QUERY_DROPZONE } from '../../../api/hooks/useCurrentDropzone';

interface IOverride {
  currentUser?: Partial<DropzoneUser>;
  dropzone?: Partial<Dropzone>;
}
export const MOCK_QUERY_DROPZONE = (overrides?: IOverride) => ({
  request: {
    query: QUERY_DROPZONE,
    variables: {
      dropzoneId: 2,
      earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
    },
    fetchPolicy: 'no-cache',
  },
  result: {
    data: {
      dropzone: {
        id: '2',
        lat: -10.24124,
        lng: 54.123123,
        name: 'Skydive Jest',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        planes: [
          { id: '1', name: 'C182', registration: 'ABC-123' } as Plane,
          { id: '2', name: 'Caravan', registration: 'CDE-456' } as Plane,
        ],
        ticketTypes: [
          { id: '1', name: 'Height' } as TicketType,
          { id: '2', name: 'Tandem' } as TicketType,
          { id: '3', name: 'Hop n Pop' } as TicketType,
        ],
        currentConditions: {
          id: 1,
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
          transactions: null,
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
                  id: 1,
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
                  id: 1,
                },
              },
            ],

            jumpTypes: [
              { id: '1', name: 'Freefly' },
              { id: '2', name: 'Angle/Tracking' },
            ],
            license: { id: '1', name: 'Certificate C' },
          },
          ...overrides?.currentUser,
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
                isFull: true,
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
                isFull: false,
              },
            },
          ],
        },
        ...overrides?.dropzone,
      } as Dropzone,
    },
  },
});
