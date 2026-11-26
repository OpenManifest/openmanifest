import { AllowedActivityTypesQuery, AllowedActivityTypesQueryVariables } from 'app/api/operations';
import { AllowedActivityTypesDocument } from 'app/api/reflection';
import createMockedQuery from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

export const MOCK_QUERY_ALLOWED_ACTIVITY_TYPES = createMockedQuery<
  AllowedActivityTypesQueryVariables,
  DeepRequired<AllowedActivityTypesQuery>
>(
  AllowedActivityTypesDocument,
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

      allowedActivityTypes: [
        { id: '1', name: 'Freefly', __typename: 'ActivityType' },
        { id: '2', name: 'Angle/Tracking', __typename: 'ActivityType' },
      ],
    },
    activityTypes: [
      { id: '1', name: 'Freefly', __typename: 'ActivityType' },
      { id: '2', name: 'Angle/Tracking', __typename: 'ActivityType' },
    ],
  }
);
