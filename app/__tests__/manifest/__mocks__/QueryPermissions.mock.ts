import {
  CurrentUserPermissionsQuery,
  CurrentUserPermissionsQueryVariables,
} from '../../../api/operations';
import { CurrentUserPermissionsDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<CurrentUserPermissionsQueryVariables, CurrentUserPermissionsQuery>(
  CurrentUserPermissionsDocument,
  { operatorId: '1' },
  {
    operator: {
      __typename: 'Operator',
      id: '1',
      name: 'Skydive Jest',
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',

      // Same user as the Operator fixture's `currentUser`: both queries write Operator.currentUser, so a different
      // id here would replace the reference and leave the Operator query's data incomplete.
      currentUser: {
        __typename: 'Membership',
        id: '123',
        role: {
          __typename: 'UserRole',
          id: '1',
          // Same role as `currentUserDetailed`: both write Membership 123's role, and the last one to arrive wins.
          name: 'fun_jumper',
          operatorId: 1,
        },
        permissions: [],
      },
    },
  }
);
