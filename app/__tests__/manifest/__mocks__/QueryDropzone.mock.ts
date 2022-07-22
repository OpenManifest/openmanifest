import startOfDay from 'date-fns/startOfDay';
import { dropzoneExtensive } from 'app/__fixtures__/dropzone.fixture';
import { QueryDropzoneDocument } from '../../../api/reflection';
import { QueryDropzoneQuery, QueryDropzoneQueryVariables } from '../../../api/operations';
import createMock from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

export default createMock<QueryDropzoneQueryVariables, DeepRequired<QueryDropzoneQuery>>(
  QueryDropzoneDocument,
  {
    dropzoneId: 1,
    earliestTimestamp: startOfDay(new Date()).toISOString(),
  },
  {
    __typename: 'Query',
    dropzone: {
      ...dropzoneExtensive,
    },
  }
);
