import { fromSi, toSi, unitOf, type UnitSystem } from 'app/i18n/units';

/**
 * What only skydiving knows about its equipment: the `rig` kind, its type and its canopy. The generic equipment screens
 * work for any kind; the wizard steps and the wing loading of this feature read these attributes.
 */
export const RIG_KIND = 'rig';

export type RigType = 'student' | 'sport' | 'tandem';
export const RIG_TYPES: RigType[] = ['student', 'sport', 'tandem'];

type WithKind = { equipmentKind?: { key: string } | null; attributes?: unknown };

export const isRig = (equipment?: WithKind | null): boolean =>
  equipment?.equipmentKind?.key === RIG_KIND;

type RigAttributes = { rig_type?: RigType; canopy_size_m2?: number; pack_value?: number };

export const rigAttributes = (equipment?: WithKind | null): RigAttributes =>
  (equipment?.attributes ?? {}) as RigAttributes;

/** The rig kind of a list of kinds (an operator's), if it has one */
export const findRigKind = <K extends { key: string }>(kinds?: K[] | null): K | undefined =>
  kinds?.find((kind) => kind.key === RIG_KIND);

/** The canopy size in the operator's area unit (square feet for a skydiving operator), rounded */
export function canopySize(equipment?: WithKind | null, units?: UnitSystem | null): number | null {
  const squareMetres = rigAttributes(equipment).canopy_size_m2;
  if (!squareMetres) return null;
  return Math.round(fromSi('area', squareMetres, unitOf('area', units)));
}

/** A canopy size typed in the operator's area unit as the square metres the API takes */
export const canopySizeToSquareMetres = (size: number, units?: UnitSystem | null): number =>
  Math.round(toSi('area', size, unitOf('area', units)) * 10000) / 10000;

const POUNDS_PER_KILOGRAM = 2.20462;
const SQUARE_FEET_PER_SQUARE_METRE = 10.7639104;

/** Pounds per square foot of canopy for a jumper of this body mass: "1.23" */
export function calculateWingLoading(bodyMassKg: number, canopySquareMetres: number): string {
  const loading =
    (POUNDS_PER_KILOGRAM * bodyMassKg) / (canopySquareMetres * SQUARE_FEET_PER_SQUARE_METRE);
  return (Math.round(loading * 100) / 100).toFixed(2);
}

/** The wing loading under a rig, or null when the rig has no canopy size */
export function wingLoadingOf(
  equipment: WithKind | null | undefined,
  bodyMassKg?: number | null
): string | null {
  const squareMetres = rigAttributes(equipment).canopy_size_m2;
  if (!squareMetres || !bodyMassKg) return null;
  return calculateWingLoading(bodyMassKg, squareMetres);
}
