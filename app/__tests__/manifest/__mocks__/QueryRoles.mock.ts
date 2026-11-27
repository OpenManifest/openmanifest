import { RolesQuery, RolesQueryVariables } from '../../../api/operations';
import { RolesDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<RolesQueryVariables, RolesQuery>(
  RolesDocument,
  { operatorId: '1' },
  {
    operator: {
      __typename: 'Operator',
      id: '1',
      roles: [
        {
          __typename: 'UserRole',
          id: '1',
          name: 'fun_jumper',
          operatorId: 1,
          permissions: ['readLoad', 'createSlot'],
        },
      ],
    },
  }
);
