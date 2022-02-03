import { DropzoneUsersQuery, DropzoneUsersQueryVariables } from '../../../api/operations';
import { DropzoneUsersDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export default createMockedQuery<DropzoneUsersQueryVariables, DeepRequired<DropzoneUsersQuery>>(
  DropzoneUsersDocument,
  { dropzoneId: 1 },
  {
    __typename: 'Query',
    dropzone: {
      __typename: 'Dropzone',
      id: '1',
      name: 'Test Load',
      dropzoneUsers: {
        __typename: 'DropzoneUserConnection',
        edges: [],
      },
    },
  }
);
