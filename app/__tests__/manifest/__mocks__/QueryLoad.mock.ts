import { LoadState } from '../../../api/schema.d';
import { LoadDetailsFragment, LoadQuery } from '../../../api/operations';
import { LoadDocument } from '../../../api/reflection';

export const MOCK_QUERY_LOAD = (override: Partial<LoadDetailsFragment>) => ({
  request: {
    query: LoadDocument,
    variables: {
      id: 1,
    },
  },
  result: (): { data: LoadQuery } => {
    return {
      data: {
        load: {
          id: '1',
          name: 'Test Load',
          createdAt: new Date().getTime() / 1000 - 30 * 60 * 60,
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
          plane: {
            id: '1',
            maxSlots: 10,
            name: 'Beaver',
          },
          gca: {
            id: '1',
            user: {
              id: '1',
              name: 'jest',
            },
          },
          pilot: {
            id: '2',

            user: {
              id: '2',
              name: 'Jess I. Canflie',
            },
          },

          loadMaster: null,
          slots: [
            {
              id: '1',
              createdAt: (new Date().getTime() - 120000) / 1000,
              exitWeight: 100,
              passengerName: null,
              passengerExitWeight: null,
              wingLoading: 1.3,
              dropzoneUser: {
                id: '1',
                role: {
                  id: '1',
                  name: 'fun_jumper',
                },
                user: {
                  id: '1',
                  name: 'Amy Hops',
                  exitWeight: '100',
                  license: {
                    id: '1',
                    name: 'Certificate A',
                  },
                },
              },
              ticketType: {
                id: '1',
                name: 'Height',
                altitude: 14000,
                isTandem: false,

                extras: [],
              },

              jumpType: {
                id: '1',
                name: 'Freefly',
              },
              extras: null,
            },
            {
              id: '2',
              createdAt: (new Date().getTime() - 180000) / 1000,
              exitWeight: 70,
              passengerName: null,
              passengerExitWeight: null,
              wingLoading: 1.3,
              dropzoneUser: {
                id: '2',
                role: {
                  id: '1',
                  name: 'fun_jumper',
                },
                user: {
                  id: '2',
                  name: 'Ali Falls',
                  exitWeight: '100',
                  license: {
                    id: '1',
                    name: 'Certificate A',
                  },
                },
              },
              ticketType: {
                id: '2',
                name: 'Hop n Pop',
                altitude: 4000,
                isTandem: false,

                extras: [],
              },

              jumpType: {
                id: '2',
                name: 'Hop n Pop',
              },
              extras: null,
            },
            {
              id: '3',
              createdAt: (new Date().getTime() - 240000) / 1000,
              exitWeight: 100,
              passengerName: null,
              passengerExitWeight: null,
              wingLoading: 1.3,
              dropzoneUser: {
                id: '3',
                role: {
                  id: '1',
                  name: 'fun_jumper',
                },
                user: {
                  id: '3',
                  name: 'John Stumble',
                  exitWeight: '100',
                  license: {
                    id: '3',
                    name: 'Certificate C',
                  },
                },
              },
              ticketType: {
                id: '3',
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
          ...override,
        },
      },
    };
  },
});
