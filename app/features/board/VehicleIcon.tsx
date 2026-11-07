import * as React from 'react';
import { Icon, type IconName, type StatusKey, type TextTone } from 'app/ui';
import { useOperatorContext } from 'app/providers/operator/context';

/**
 * The glyph of a vehicle kind (GENERALISATION §14, D10). This module is the one place that names the aeroplane glyphs:
 * everything else asks it for the glyph of a kind, or of what a vehicle does (`useVehicleGlyphs`).
 */
const GLYPHS: Record<string, IconName> = {
  aircraft: 'airplane',
  glider: 'airplane',
  tug: 'airplane-takeoff',
  helicopter: 'helicopter',
  balloon: 'airballoon',
  boat: 'ferry',
  raft: 'rowing',
  kayak: 'kayaking',
  bus: 'bus',
  '4x4': 'car-estate',
  van: 'van-passenger',
  vehicle: 'car',
};

/** The glyph of a vehicle kind; a kind that is not listed gets the plain car */
export function vehicleGlyph(kind?: string | null): IconName {
  return GLYPHS[(kind ?? '').toLowerCase()] ?? 'car';
}

/** What a vehicle (or a load in it) does, for the actions, states and empty lists that show it */
export type VehicleMotion = 'depart' | 'land' | 'none' | 'board';

/** Kinds that take off and land: their motions are the aeroplane glyphs */
const AIRCRAFT_KINDS = ['aircraft', 'glider', 'tug'];

const AIRCRAFT_MOTION: Record<VehicleMotion, IconName> = {
  depart: 'airplane-takeoff',
  land: 'airplane-landing',
  none: 'airplane-off',
  board: 'airplane-plus',
};

/** Every other kind (a boat, a bus, a generic operator's vehicle): neutral glyphs */
const NEUTRAL_MOTION: Record<VehicleMotion, IconName> = {
  depart: 'arrow-top-right',
  land: 'flag-checkered',
  none: 'calendar-remove-outline',
  board: 'account-plus-outline',
};

/** The glyph of a motion of a vehicle kind: an aeroplane taking off for an aircraft, an arrow for a bus */
export function motionGlyph(motion: VehicleMotion, kind?: string | null): IconName {
  const aircraft = AIRCRAFT_KINDS.includes((kind ?? '').toLowerCase());
  return (aircraft ? AIRCRAFT_MOTION : NEUTRAL_MOTION)[motion];
}

/** The icon of a load's status badge for a vehicle kind: departed and landed follow the vehicle, the rest are the badge's own */
export function statusGlyph(status: StatusKey, kind?: string | null): IconName | undefined {
  if (status === 'departed') return motionGlyph('depart', kind);
  if (status === 'landed') return motionGlyph('land', kind);
  return undefined;
}

/**
 * The glyphs of a vehicle kind (a load's vehicle), or of the operator's main kind (the first of
 * `operator.vehicleKinds`) when there is none: for the actions, states and empty states of loads.
 */
export function useVehicleGlyphs(vehicleKind?: string | null) {
  const {
    operator: { operator },
  } = useOperatorContext();
  const kind = vehicleKind || operator?.vehicleKinds?.[0];

  return React.useMemo(
    () => ({
      kind,
      vehicle: vehicleGlyph(kind),
      motion: (motion: VehicleMotion) => motionGlyph(motion, kind),
      status: (status: StatusKey) => statusGlyph(status, kind),
    }),
    [kind]
  );
}

export type VehicleIconProps = {
  /** The `kind` of the vehicle; the operator's main kind when it is left out */
  kind?: string | null;
  size?: number;
  tone?: TextTone;
};

/** The glyph of a vehicle's kind: an aeroplane for an aircraft, a boat for a boat; decorative, the name sits beside it */
export default function VehicleIcon({ kind, size = 20, tone = 'muted' }: VehicleIconProps) {
  const glyphs = useVehicleGlyphs(kind);
  return <Icon name={glyphs.vehicle} size={size} tone={tone} />;
}
