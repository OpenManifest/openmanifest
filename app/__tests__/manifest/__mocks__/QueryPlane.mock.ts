import { PlanesQuery, PlanesQueryVariables } from '../../../api/operations';
import { PlanesDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<PlanesQueryVariables, PlanesQuery>(
  PlanesDocument,
  { dropzoneId: 1 },
  {
    planes: [
      {
        registration: 'ABC123',
        id: '1',

        maxSlots: 10,
        name: 'Beaver',
      },
    ],
  }
);
