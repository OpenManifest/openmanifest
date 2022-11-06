import { ModerationRole } from 'app/api/schema.d';
import { CurrentUserDetailedFragment } from 'app/api/operations';
import { addDays, startOfDay } from 'date-fns';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export const currentUserDetailed: DeepRequired<CurrentUserDetailedFragment> = {
  __typename: 'DropzoneUser',
  id: '123',
  license: {
    id: '1',
    name: 'Certifiate D',
    federation: {
      __typename: 'Federation',
      id: '1',
      name: 'APF',
      slug: 'apf',
    },
    __typename: 'License',
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
    __typename: 'OrderConnection',
    edges: [],
  },

  role: {
    id: '1',
    dropzoneId: 1,
    name: 'fun_jumper',
    __typename: 'UserRole',
  },

  rigInspections: [],
  availableRigs: [],

  user: {
    __typename: 'User',
    apfNumber: null,
    moderationRole: ModerationRole.User,
    nickname: 'Jex',
    userFederations: [],
    id: '234',
    name: 'Court Jester',
    exitWeight: '100',
    email: 'jest@test.com',
    phone: '123456789',
    pushToken: null,
    image: null,
    dropzoneUsers: [],

    rigs: [
      {
        __typename: 'Rig',
        id: '1',
        isPublic: true,
        name: 'Primary',
        packingCard: null,
        make: 'Vector',
        model: 'V310',
        serial: '12345',
        canopySize: 150,
        dropzone: null,
        maintainedAt: null,
        packValue: null,
        rigType: 'sport',
        repackExpiresAt: addDays(new Date(), 20).getTime() / 1000,
        owner: {
          id: '1',
          __typename: 'User',
          name: 'Court Jester',
          rigs: null,
        },
      },
      {
        __typename: 'Rig',
        id: '2',
        name: 'Pond',
        make: 'Mirage',
        isPublic: true,
        packingCard: null,
        model: 'G4.1',
        serial: '34567',
        canopySize: 170,
        dropzone: null,
        maintainedAt: null,
        packValue: null,
        rigType: 'sport',
        repackExpiresAt: startOfDay(new Date()).getTime() / 1000,
        owner: {
          id: '1',
          __typename: 'User',
          name: 'Court Jester',
          rigs: null,
        },
      },
    ],
  },
};
