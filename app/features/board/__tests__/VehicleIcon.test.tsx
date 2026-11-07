import { motionGlyph, statusGlyph, vehicleGlyph } from '../VehicleIcon';

describe('vehicleGlyph', () => {
  it('maps a kind to its glyph, and an unknown kind to a car', () => {
    expect(vehicleGlyph('aircraft')).toBe('airplane');
    expect(vehicleGlyph('tug')).toBe('airplane-takeoff');
    expect(vehicleGlyph('raft')).toBe('rowing');
    expect(vehicleGlyph('boat')).toBe('ferry');
    expect(vehicleGlyph('hovercraft')).toBe('car');
    expect(vehicleGlyph(null)).toBe('car');
  });
});

describe('motionGlyph', () => {
  it('takes off and lands an aircraft, and keeps every other kind neutral', () => {
    expect(motionGlyph('depart', 'aircraft')).toBe('airplane-takeoff');
    expect(motionGlyph('land', 'glider')).toBe('airplane-landing');
    expect(motionGlyph('none', 'aircraft')).toBe('airplane-off');
    expect(motionGlyph('board', 'aircraft')).toBe('airplane-plus');
    for (const kind of ['vehicle', 'boat', 'bus', undefined, null]) {
      for (const motion of ['depart', 'land', 'none', 'board'] as const) {
        expect(motionGlyph(motion, kind)).not.toMatch(/airplane/);
      }
    }
  });

  it('gives a load status badge the icon of the vehicle for departed and landed only', () => {
    expect(statusGlyph('departed', 'aircraft')).toBe('airplane-takeoff');
    expect(statusGlyph('landed', 'vehicle')).toBe('flag-checkered');
    expect(statusGlyph('boarding', 'aircraft')).toBeUndefined();
  });
});
