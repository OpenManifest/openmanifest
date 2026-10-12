import { operatorExtensive } from 'app/__fixtures__/operator.fixture';
import { OperatorDocument } from '../../../api/reflection';
import { OperatorQuery, OperatorQueryVariables } from '../../../api/operations';
import createMock from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

export default createMock<OperatorQueryVariables, DeepRequired<OperatorQuery>>(
  OperatorDocument,
  {
    operatorId: '1',
  },
  {
    __typename: 'Query',
    operator: {
      ...operatorExtensive,
    },
  }
);
