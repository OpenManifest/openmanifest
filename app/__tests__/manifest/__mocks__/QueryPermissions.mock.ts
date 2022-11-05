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
      id: '1',
      name: 'Skydive Jest',
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',

      currentUser: {
        id: '10',
        role: {
          id: '1',
          name: 'jest',
          dropzoneId: 1,
        },
        permissions: [],
      },
    },
  }
);
