import { RolesQuery, RolesQueryVariables } from '../../../api/operations';
import { RolesDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<RolesQueryVariables, RolesQuery>(
  RolesDocument,
  { dropzoneId: '1' },
  {
    dropzone: {
      __typename: 'Dropzone',
      id: '1',
      roles: [
        {
          __typename: 'UserRole',
          id: '1',
          name: 'fun_jumper',
          dropzoneId: 1,
          permissions: ['readLoad', 'createSlot'],
        },
      ],
    },
  }
);
