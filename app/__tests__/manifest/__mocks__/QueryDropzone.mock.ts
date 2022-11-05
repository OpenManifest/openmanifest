import { dropzoneExtensive } from 'app/__fixtures__/dropzone.fixture';
import { DropzoneDocument } from '../../../api/reflection';
import { DropzoneQuery, DropzoneQueryVariables } from '../../../api/operations';
import createMock from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

export default createMock<DropzoneQueryVariables, DeepRequired<DropzoneQuery>>(
  DropzoneDocument,
  {
    dropzoneId: '1',
  },
  {
    __typename: 'Query',
    dropzone: {
      ...dropzoneExtensive,
    },
  }
);
