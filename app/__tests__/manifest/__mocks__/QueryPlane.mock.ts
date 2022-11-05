import { PlanesQuery, PlanesQueryVariables } from '../../../api/operations';
import { PlanesDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export default createMockedQuery<PlanesQueryVariables, DeepRequired<PlanesQuery>>(
  PlanesDocument,
  { dropzoneId: '1' },
  {
    __typename: 'Query',
    planes: [
      {
        __typename: 'Plane',
        registration: 'ABC123',
        id: '1',
        minSlots: 0,
        maxSlots: 10,
        name: 'Beaver',
      },
    ],
  }
);
