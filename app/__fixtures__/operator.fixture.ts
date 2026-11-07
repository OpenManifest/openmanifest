import { OperatorExtensiveFragment } from 'app/api/operations';
import { Industry, OperatorState, LoadState } from 'app/api/schema.d';
import { currentUserDetailed } from './currentUser.fixture';
import { loadEssentials } from './load.fixture';
import { rigKind } from './equipmentKind.fixture';

/** The skydiving template's modules (config/industries/skydiving/template.yml): the fixture operator has none */
export const SKYDIVING_MODULES = {
  destinations: { kinds: ['altitude'], scope: 'per_slot' },
  activities: {},
  certifications: { required_by_default: true },
  equipment: { rentals: true, personal: true },
  escorts: { ratio: '1:1' },
  limits: { mass: true, payload: true, age: true },
  conditions: { kind: 'winds_aloft' },
  daily_log: {},
};

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

export const operatorExtensive: DeepRequired<OperatorExtensiveFragment> = {
  __typename: 'Operator',
  id: '1',
  walletId: '1',
  lat: -10.24124,
  lng: 54.123123,
  banner: null,
  name: 'Skydive Jest',
  primaryColor: '#000000',
  secondaryColor: '#FFFFFF',
  status: OperatorState.Public,
  isCreditSystemEnabled: true,
  timeZone: 'Australia/Brisbane',
  terminology: {},
  industry: Industry.Skydiving,
  template: {
    __typename: 'IndustryTemplate',
    slug: Industry.Skydiving,
    name: 'Dropzone',
    icon: 'parachute',
    illustrations: 'skydiving',
  },
  vehicleKinds: ['aircraft'],
  modules: {},

  callScheduleMinutes: [20, 15, 10],
  currency: 'AUD',
  units: {
    altitude: 'ft',
    area: 'ft2',
    depth: 'm',
    distance: 'km',
    mass: 'kg',
    speed: 'kn',
    temperature: 'c',
  },
  settings: {
    __typename: 'Settings',
    allowManifestBypass: false,
    allowNegativeCredits: false,
    requireCredits: false,
    requireEquipment: false,
    requireCertification: false,
    requireMembership: false,
    requireEquipmentInService: false,
    requireEquipmentInspection: false,
    allowDoubleManifesting: false,
    allowSelfManifest: true,
  },
  createdAt: new Date().toISOString(),
  certificationBodies: [
    {
      __typename: 'CertificationBody',
      id: '1',
      name: 'apf',
      slug: 'apf',
      industry: 'skydiving',
      verificationProvider: 'apf',
    },
  ],
  requiredQualifications: [],
  equipmentKinds: [rigKind],
  currentConditions: {
    __typename: 'WeatherCondition',
    id: '1',
    jumpRun: 90,
    temperatureC: -1,
    offsetDirection: null,
    offsetM: null,
    createdAt: new Date().toISOString(),
    exitSpotM: null,
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
