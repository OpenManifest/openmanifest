import type { EquipmentKindEssentialsFragment } from 'app/api/operations';

type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

/** The parachute kind (key `rig`) a skydiving operator is given by its template */
export const parachuteKind: DeepRequired<EquipmentKindEssentialsFragment> = {
  __typename: 'EquipmentKind',
  id: '1',
  key: 'rig',
  name: 'Rig',
  attributeSchema: {
    rig_type: {
      type: 'enum',
      label: 'Rig type',
      values: ['student', 'sport', 'tandem'],
      default: 'sport',
      operator_only: true,
      not_rentable: ['tandem'],
    },
    canopy_size_m2: { type: 'decimal', label: 'Main canopy size', min: 0, unit: 'area' },
    pack_value: { type: 'integer', label: 'Pack value', min: 0 },
  },
  serviceIntervalDays: 180,
  inspectionValidDays: null,
  requiredBy: { always: true },
  position: 0,
  inspectionFormTemplate: {
    __typename: 'FormTemplate',
    id: '1',
    name: 'Equipment Inspection',
    definition: '[]',
  },
};

export const parachuteKindRef = {
  __typename: 'EquipmentKind' as const,
  id: '1',
  key: 'rig',
  name: 'Rig',
};

/** The label of the parachute kind's type attribute ("Rig type") */
export const parachuteTypeLabel = 'Rig type';
