import {
  CertificationLevelsQuery,
  CertificationLevelsQueryVariables,
} from '../../../api/operations';
import { CertificationLevelsDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<CertificationLevelsQueryVariables, CertificationLevelsQuery>(
  CertificationLevelsDocument,
  {},
  {
    certificationLevels: [
      {
        __typename: 'CertificationLevel',
        id: '1',
        name: 'Certificate A',
        rank: 20,
        equivalenceKey: 'a',
        certificationBody: {
          __typename: 'CertificationBody',
          id: '1',
          name: 'APF',
          slug: 'apf',
          industry: 'skydiving',
          verificationProvider: 'apf',
        },
      },
    ],
  }
);
