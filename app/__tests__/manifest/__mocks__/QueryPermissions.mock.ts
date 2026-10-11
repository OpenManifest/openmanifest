import {
  CurrentUserPermissionsQuery,
  CurrentUserPermissionsQueryVariables,
} from '../../../api/operations';
import { CurrentUserPermissionsDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<CurrentUserPermissionsQueryVariables, CurrentUserPermissionsQuery>(
  CurrentUserPermissionsDocument,
  { dropzoneId: '1' },
  {
    dropzone: {
      __typename: 'Dropzone',
      id: '1',
      name: 'Skydive Jest',
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',

      // Same user as the Dropzone fixture's `currentUser`: both queries write Dropzone.currentUser, so a different
      // id here would replace the reference and leave the Dropzone query's data incomplete.
      currentUser: {
        __typename: 'DropzoneUser',
        id: '123',
        role: {
          __typename: 'UserRole',
          id: '1',
          name: 'jest',
          dropzoneId: 1,
        },
        permissions: [],
      },
    },
  }
);
