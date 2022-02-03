import { LoadState } from 'app/api/schema.d';
import { LoadEssentialsFragment } from 'app/api/operations';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;
export const loadEssentials: DeepRequired<LoadEssentialsFragment> = {
  __typename: 'Load',
  id: '1',
  name: null,
  state: LoadState.Open,
  loadNumber: 1,
  isOpen: false,
  maxSlots: 4,
  availableSlots: 10,
  createdAt: new Date().getTime() - 35000,
  isFull: false,
  occupiedSlots: 3,
  weight: 123,
  dispatchAt: null,
  hasLanded: false,
};
