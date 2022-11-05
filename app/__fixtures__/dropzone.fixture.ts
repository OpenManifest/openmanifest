import { DropzoneExtensiveFragment } from 'app/api/operations';
import { DropzoneState, LoadState } from 'app/api/schema.d';
import { ticketTypeEssentials } from './ticketType.fixture';
import { currentUserDetailed } from './currentUser.fixture';
import { loadEssentials } from './load.fixture';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export const dropzoneExtensive: DeepRequired<DropzoneExtensiveFragment> = {
  __typename: 'Dropzone',
  id: '1',
  lat: -10.24124,
  lng: 54.123123,
  banner: null,
  name: 'Skydive Jest',
  primaryColor: '#000000',
  secondaryColor: '#FFFFFF',
  status: DropzoneState.Public,
  isCreditSystemEnabled: true,
  createdAt: new Date().toISOString(),
  federation: {
    __typename: 'Federation',
    id: '1',
    name: 'apf',
    slug: 'apf',
  },
  planes: [
    {
      id: '1',
      name: 'C182',
      registration: 'ABC-123',
      maxSlots: 4,
      minSlots: 0,
      __typename: 'Plane',
    },
    {
      id: '2',
      name: 'Caravan',
      registration: 'CDE-456',
      maxSlots: 16,
      minSlots: 0,
      __typename: 'Plane',
    },
  ],
  ticketTypes: [
    {
      ...ticketTypeEssentials,
      __typename: 'TicketType',
      id: '1',
      name: 'Height',
      cost: 123,
      extras: [],
      altitude: 14000,
    },
    {
      ...ticketTypeEssentials,
      __typename: 'TicketType',
      id: '2',
      name: 'Tandem',
      cost: 199,
      isTandem: true,
      extras: [],
    },
    {
      ...ticketTypeEssentials,
      id: '3',
      cost: 10,
      altitude: 4000,
      extras: [],
    },
  ],
  currentConditions: {
    __typename: 'WeatherCondition',
    id: '1',
    jumpRun: 90,
    temperature: -1,
    offsetDirection: null,
    offsetMiles: null,
    createdAt: new Date().toISOString(),
    exitSpotMiles: null,
    winds: [],
  },

  currentUser: {
    ...currentUserDetailed,
  },
};

const loads = {
  loads: {
    __typename: 'LoadConnection',
    edges: [
      {
        __typename: 'LoadEdge',
        node: {
          ...loadEssentials,
          __typename: 'Load',
          id: '1',
          name: null,
          state: LoadState.Open,
          loadNumber: 1,
          isOpen: false,
          maxSlots: 4,
        },
      },
      {
        __typename: 'LoadEdge',
        node: {
          ...loadEssentials,
          __typename: 'Load',
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
};
