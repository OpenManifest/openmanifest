import { DropzoneUsersQuery, DropzoneUsersQueryVariables } from '../../../api/operations';
import { DropzoneUsersDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<DropzoneUsersQueryVariables, DropzoneUsersQuery>(
  DropzoneUsersDocument,
  { dropzoneId: 1 },
  {
    dropzone: {
      id: '1',
      name: 'Test Load',
      dropzoneUsers: {
        edges: [],
      },
    },
  }
);
