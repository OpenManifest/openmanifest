import { MembershipsQuery, MembershipsQueryVariables } from '../../../api/operations';
import { MembershipsDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export default createMockedQuery<MembershipsQueryVariables, DeepRequired<MembershipsQuery>>(
  MembershipsDocument,
  { operatorId: '1' },
  {
    __typename: 'Query',
    memberships: {
      __typename: 'MembershipConnection',
      edges: [],
    },
  }
);
