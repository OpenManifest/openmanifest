import { EquipmentEssentialsFragment } from 'app/api/operations';
import { DateTime } from 'luxon';
import { parachuteKindRef } from './equipmentKind.fixture';

export const currentUserEssentials: EquipmentEssentialsFragment = {
  id: '2',
  name: 'Pond',
  make: 'Mirage',
  isPublic: true,
  packingCard: null,
  model: 'G4.1',
  serial: '34567',
  ownership: 'personal',
  attributes: { rig_type: 'sport', canopy_size_m2: 15.7935 },
  equipmentKind: parachuteKindRef,
  inService: true,
  serviceDueAt: DateTime.now().startOf('day').toSeconds(),
  owner: {
    id: '1',
  },
};
