import {
  CertificationBodiesQuery,
  CertificationBodiesQueryVariables,
} from '../../../api/operations';
import { CertificationBodiesDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<CertificationBodiesQueryVariables, CertificationBodiesQuery>(
  CertificationBodiesDocument,
  {},
  {
    certificationBodies: [
      {
        __typename: 'CertificationBody',
        id: '1',
        name: 'APF',
        slug: 'apf',
        industry: 'skydiving',
        verificationProvider: 'apf',
      },
    ],
  }
);
