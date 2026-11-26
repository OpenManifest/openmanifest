import type { ProfileQuery, ProfileQueryVariables } from 'app/api/operations';
import { ProfileDocument } from 'app/api/reflection';
import createMockedQuery from 'app/__tests__/manifest/__mocks__/createMockedQuery.mock';
import { currentUserDetailed } from './currentUser.fixture';
import { loadEssentials } from './load.fixture';
import { rule } from './people.fixture';

export { rule };

/** A place the member had on Load #12, as the Profile query lists it */
export const profileSlot = {
  __typename: 'Slot' as const,
  id: '900',
  costCents: 2500,
  load: {
    __typename: 'Load' as const,
    id: '12',
    loadNumber: 12,
    loadDate: '2026-10-08',
    state: loadEssentials.state,
  },
  activityType: { __typename: 'ActivityType' as const, id: '1', name: 'Freefly' },
  ticketType: { __typename: 'TicketType' as const, id: '3', name: 'Full altitude' },
};

const certification = {
  __typename: 'UserCertification' as const,
  id: '41',
  uid: null,
  number: '12345',
  verifiedAt: '2026-01-02T00:00:00Z',
  certificationBody: {
    __typename: 'CertificationBody' as const,
    id: '1',
    name: 'APF',
    slug: 'apf',
    industry: 'skydiving',
    verificationProvider: 'apf',
  },
  certificationLevel: {
    __typename: 'CertificationLevel' as const,
    id: '1',
    name: 'Certifiate D',
    rank: 50,
    equivalenceKey: 'd',
  },
  qualifications: [
    {
      __typename: 'UserQualification' as const,
      id: '51',
      name: 'Camera',
      number: 'C-7',
      expiresAt: '2099-03-04',
      current: true,
      verifiedAt: null,
      qualification: {
        __typename: 'Qualification' as const,
        id: '61',
        name: 'Camera',
        slug: 'camera',
      },
    },
  ],
};

/** Court Jester's membership as the Profile query returns it: ready, with a licence, two rigs and one load */
export const profile = {
  ...currentUserDetailed,
  expiresAt: 4102444800,
  creditsCents: 10000,
  permissions: [],
  eligibility: {
    __typename: 'MembershipEligibility' as const,
    ready: true,
    rules: [
      rule('credits', true, 'PASS'),
      rule('certification', true, 'PASS'),
      rule('age', true, 'NOT_REQUIRED'),
    ],
  },
  userCertification: { __typename: 'UserCertification' as const, id: '41' },
  user: { ...currentUserDetailed.user, userCertifications: [certification] },
  slots: {
    __typename: 'SlotConnection' as const,
    edges: [{ __typename: 'SlotEdge' as const, node: profileSlot }],
    pageInfo: { __typename: 'PageInfo' as const, hasNextPage: false },
  },
};

/** The Profile query of membership 123 (Court Jester), 20 loads at first */
export const mockProfileQuery = createMockedQuery<ProfileQueryVariables, ProfileQuery>(
  ProfileDocument,
  { id: '123', slots: 20 },
  { membership: profile as never }
);
