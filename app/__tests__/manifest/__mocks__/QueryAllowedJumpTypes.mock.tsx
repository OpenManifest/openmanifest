import { AllowedJumpTypesQuery, AllowedJumpTypesQueryVariables } from 'app/api/operations';
import { AllowedJumpTypesDocument } from 'app/api/reflection';
import createMockedQuery from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

export const MOCK_QUERY_ALLOWED_JUMP_TYPES = createMockedQuery<
  AllowedJumpTypesQueryVariables,
  DeepRequired<AllowedJumpTypesQuery>
>(
  AllowedJumpTypesDocument,
  {
    operatorId: '1',

    allowedForMembershipIds: [],
  },
  {
    __typename: 'Query',
    operator: {
      id: '1',
      ticketTypes: [],
      __typename: 'Operator',

      allowedJumpTypes: [
        { id: '1', name: 'Freefly', __typename: 'JumpType' },
        { id: '2', name: 'Angle/Tracking', __typename: 'JumpType' },
      ],
    },
    jumpTypes: [
      { id: '1', name: 'Freefly', __typename: 'JumpType' },
      { id: '2', name: 'Angle/Tracking', __typename: 'JumpType' },
    ],
  }
);
