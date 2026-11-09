import { motionGlyph, statusGlyph, vehicleGlyph } from '../VehicleIcon';
import { AVIATION_VEHICLE_KIND } from 'app/features/aviation/kinds';

describe('vehicleGlyph', () => {
  it('maps a kind to its glyph, and an unknown kind to a car', () => {
    expect(vehicleGlyph(AVIATION_VEHICLE_KIND)).toBe('airplane');
    expect(vehicleGlyph('tug')).toBe('airplane-takeoff');
    expect(vehicleGlyph('raft')).toBe('rowing');
    expect(vehicleGlyph('boat')).toBe('ferry');
    expect(vehicleGlyph('hovercraft')).toBe('car');
    expect(vehicleGlyph(null)).toBe('car');
  });
});

describe('motionGlyph', () => {
  it('takes off and lands a flying kind, and keeps every other kind neutral', () => {
    expect(motionGlyph('depart', AVIATION_VEHICLE_KIND)).toBe('airplane-takeoff');
    expect(motionGlyph('land', 'glider')).toBe('airplane-landing');
    expect(motionGlyph('none', AVIATION_VEHICLE_KIND)).toBe('airplane-off');
    expect(motionGlyph('board', AVIATION_VEHICLE_KIND)).toBe('airplane-plus');
    for (const kind of ['vehicle', 'boat', 'bus', undefined, null]) {
      for (const motion of ['depart', 'land', 'none', 'board'] as const) {
        expect(motionGlyph(motion, kind)).not.toMatch(/airplane/);
      }
    }
  });

  it('gives a load status badge the icon of the vehicle for departed and completed only', () => {
    expect(statusGlyph('departed', AVIATION_VEHICLE_KIND)).toBe('airplane-takeoff');
    expect(statusGlyph('completed', 'vehicle')).toBe('flag-checkered');
    expect(statusGlyph('boarding', AVIATION_VEHICLE_KIND)).toBeUndefined();
  });
});
