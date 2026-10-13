import { currentUserDetailed } from 'app/__fixtures__/currentUser.fixture';
import { loadEssentials } from 'app/__fixtures__/load.fixture';
import { MembershipProfileQuery, MembershipProfileQueryVariables } from '../../../api/operations';
import { MembershipProfileDocument } from '../../../api/reflection';
import createMockedQuery from '../../manifest/__mocks__/createMockedQuery.mock';

export const profileSlot = {
  __typename: 'Slot' as const,
  id: '900',
  costCents: 2500,
  createdAt: new Date().toISOString(),
  bodyMassKg: 100,
  guestName: null,
  guestBodyMassKg: null,
  wingLoading: 1.1,
  groupNumber: 0,
  equipment: [],
  extras: null,
  membership: null,
  ticketType: null,
  activityType: { __typename: 'ActivityType' as const, id: '1', name: 'Freefly' },
  load: { ...loadEssentials, id: '12', loadNumber: 12 },
};

export default createMockedQuery<MembershipProfileQueryVariables, MembershipProfileQuery>(
  MembershipProfileDocument,
  { id: '123' },
  {
    membership: {
      ...currentUserDetailed,
      creditsCents: 10000,
      slots: {
        __typename: 'SlotConnection',
        edges: [{ __typename: 'SlotEdge', node: profileSlot as never }],
      },
    } as never,
  }
);
