import { DropzoneExtensiveFragment } from 'app/api/operations';
import { DropzoneState, LoadState } from 'app/api/schema.d';
import { currentUserDetailed } from './currentUser.fixture';
import { loadEssentials } from './load.fixture';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export const dropzoneExtensive: DeepRequired<DropzoneExtensiveFragment> = {
  __typename: 'Dropzone',
  id: '1',
  walletId: '1',
  lat: -10.24124,
  lng: 54.123123,
  banner: null,
  name: 'Skydive Jest',
  primaryColor: '#000000',
  secondaryColor: '#FFFFFF',
  status: DropzoneState.Public,
  isCreditSystemEnabled: true,
  settings: {
    __typename: 'Settings',
    allowManifestBypass: false,
    allowNegativeCredits: false,
    requireCredits: false,
    requireEquipment: false,
    requireLicense: false,
    requireMembership: false,
    requireReserveInDate: false,
    requireRigInspection: false,
    allowDoubleManifesting: false,
  },
  createdAt: new Date().toISOString(),
  federation: {
    __typename: 'Federation',
    id: '1',
    name: 'apf',
    slug: 'apf',
  },
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
