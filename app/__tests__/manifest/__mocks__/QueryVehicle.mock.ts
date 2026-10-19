import { VehiclesQuery, VehiclesQueryVariables } from '../../../api/operations';
import { VehiclesDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export default createMockedQuery<VehiclesQueryVariables, DeepRequired<VehiclesQuery>>(
  VehiclesDocument,
  { operatorId: '1' },
  {
    __typename: 'Query',
    vehicles: [
      {
        __typename: 'Vehicle',
        registration: 'ABC123',
        id: '1',
        minCapacity: 0,
        capacity: 10,
        name: 'Beaver',
        kind: 'aircraft',
      },
    ],
  }
);
