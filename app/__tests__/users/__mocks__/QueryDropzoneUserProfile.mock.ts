import { currentUserDetailed } from 'app/__fixtures__/currentUser.fixture';
import { loadEssentials } from 'app/__fixtures__/load.fixture';
import {
  DropzoneUserProfileQuery,
  DropzoneUserProfileQueryVariables,
} from '../../../api/operations';
import { DropzoneUserProfileDocument } from '../../../api/reflection';
import createMockedQuery from '../../manifest/__mocks__/createMockedQuery.mock';

export const profileSlot = {
  __typename: 'Slot' as const,
  id: '900',
  cost: 25,
  createdAt: new Date().toISOString(),
  exitWeight: 100,
  passengerName: null,
  passengerExitWeight: null,
  wingLoading: 1.1,
  groupNumber: 0,
  rig: null,
  extras: null,
  dropzoneUser: null,
  ticketType: null,
  jumpType: { __typename: 'JumpType' as const, id: '1', name: 'Freefly' },
  load: { ...loadEssentials, id: '12', loadNumber: 12 },
};

export default createMockedQuery<DropzoneUserProfileQueryVariables, DropzoneUserProfileQuery>(
  DropzoneUserProfileDocument,
  { id: '123' },
  {
    dropzoneUser: {
      ...currentUserDetailed,
      credits: 100,
      slots: {
        __typename: 'SlotConnection',
        edges: [{ __typename: 'SlotEdge', node: profileSlot as never }],
      },
    } as never,
  }
);
