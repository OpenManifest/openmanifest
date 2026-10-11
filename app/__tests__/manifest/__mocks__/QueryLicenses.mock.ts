import { LicensesQuery, LicensesQueryVariables } from '../../../api/operations';
import { LicensesDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<LicensesQueryVariables, LicensesQuery>(
  LicensesDocument,
  {},
  {
    licenses: [
      {
        __typename: 'License',
        id: '1',
        name: 'Certificate A',
        federation: { __typename: 'Federation', id: '1', name: 'APF', slug: 'apf' },
      },
    ],
  }
);
