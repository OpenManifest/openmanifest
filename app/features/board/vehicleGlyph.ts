import type { IconName } from 'app/ui';

/** The glyph of a vehicle kind (GENERALISATION §14); a kind that is not listed gets the plain car */
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

export function vehicleGlyph(kind?: string | null): IconName {
  return GLYPHS[(kind ?? '').toLowerCase()] ?? 'car';
}
