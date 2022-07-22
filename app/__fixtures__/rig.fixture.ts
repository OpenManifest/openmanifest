import { RigEssentialsFragment } from 'app/api/operations';
import { startOfDay } from 'date-fns';

export const currentUserEssentials: RigEssentialsFragment = {
  id: '2',
  name: 'Pond',
  make: 'Mirage',
  isPublic: true,
  packingCard: null,
  model: 'G4.1',
  serial: '34567',
  canopySize: 170,
  repackExpiresAt: startOfDay(new Date()).getTime() / 1000,
  owner: {
    id: '1',
  },
};
