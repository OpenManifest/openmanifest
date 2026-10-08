import { FederationsQuery, FederationsQueryVariables } from '../../../api/operations';
import { FederationsDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<FederationsQueryVariables, FederationsQuery>(
  FederationsDocument,
  {},
  {
    federations: [{ __typename: 'Federation', id: '1', name: 'APF', slug: 'apf' }],
  }
);
