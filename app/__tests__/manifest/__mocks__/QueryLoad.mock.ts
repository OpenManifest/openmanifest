import { Load } from '../../../api/schema.d';
import { QUERY_LOAD } from '../../../api/hooks/useQueryLoad';

export const MOCK_QUERY_LOAD = (override: Partial<Load>) => ({
  request: {
    query: QUERY_LOAD,
    variables: {
      id: 1,
    },
  },
  result: {
    data: {
      load: {
        id: '1',
        name: 'Test Load',
        createdAt: new Date().getTime() / 1000 - 30 * 60 * 60,
        dispatchAt: null,
        hasLanded: false,
        maxSlots: 10,
        loadNumber: 1,
        isFull: false,
        isOpen: true,
        plane: {
          id: 1,
          name: 'Beaver',
        },
        gca: {
          id: 1,
          user: {
            id: 1,
            name: 'jest',
          },
        },
        pilot: {
          id: 2,

          user: {
            id: 2,
            name: 'Jess I. Canflie',
          },
        },

        loadMaster: null,
        slots: [
          {
            passengerExitWeight: null,
            passengerName: null,
            id: 1,
            createdAt: (new Date().getTime() - 120000) / 1000,
            exitWeight: 100,
            user: {
              id: 2,
              name: 'Amy Hops',
            },
            ticketType: {
              id: 1,
              name: 'Height',
              altitude: 14000,
              isTandem: false,

              extras: null,
            },

            jumpType: {
              id: 1,
              name: 'Freefly',
            },
            extras: null,
          },
          {
            id: 2,
            passengerExitWeight: null,
            passengerName: null,
            createdAt: (new Date().getTime() - 180000) / 1000,
            exitWeight: 70,
            user: {
              id: 3,
              name: 'Ali Falls',
            },
            ticketType: {
              id: 2,
              name: 'Hop n Pop',
              altitude: 4000,
              isTandem: false,

              extras: null,
            },

            jumpType: {
              id: 2,
              name: 'Hop n Pop',
            },
            extras: null,
          },
          {
            id: 3,
            passengerExitWeight: null,
            passengerName: null,
            createdAt: (new Date().getTime() - 240000) / 1000,
            exitWeight: 100,
            user: {
              id: 2,
              name: 'John Stumble',
            },
            ticketType: {
              id: 3,
              name: 'Tandem',
              altitude: 14000,
              isTandem: true,

              extras: [{ id: 1, name: 'Outside camera', cost: 120 }],
            },

            jumpType: {
              id: 3,
              name: 'Tandem',
            },
            extras: [{ id: 1, name: 'Outside camera', cost: 120 }],
          },
        ],
        ...override,
      } as Load,
    },
  },
});
