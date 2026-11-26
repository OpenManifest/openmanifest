import {
  MAX_WINDS,
  draftOf,
  emptyWind,
  hasWindsAloft,
  inputOf,
  problemsOf,
  type ConditionsDraft,
} from '../conditions';

const FEET = { altitude: 'ft', speed: 'kn', temperature: 'c' };
const METRES = { altitude: 'm', speed: 'mps', temperature: 'c' };

describe('hasWindsAloft', () => {
  it('is on for the conditions module of the winds aloft kind', () => {
    expect(hasWindsAloft({ conditions: { kind: 'winds_aloft' } })).toBe(true);
    // The old check looked for a module named after the kind: no operator has one
    expect(hasWindsAloft({ winds_aloft: {} })).toBe(false);
    expect(hasWindsAloft({ conditions: { kind: 'sea_state' } })).toBe(false);
    expect(hasWindsAloft({})).toBe(false);
    expect(hasWindsAloft(null)).toBe(false);
  });
});

describe('draftOf', () => {
  it('shows the conditions in the operator units, highest wind first', () => {
    const draft = draftOf(
      {
        jumpRun: 245,
        temperatureC: 21.4,
        winds: [
          { altitudeM: 609.6, speedMps: 2.57, direction: 180, temperatureC: 18 },
          { altitudeM: 4267.2, speedMps: 10.29, direction: 250, temperatureC: -12 },
        ],
      } as never,
      FEET
    );
    expect(draft).toEqual({
      temperature: 21.4,
      jumpRun: 245,
      winds: [
        { altitude: 14000, speed: 20, direction: 250, temperatureC: -12 },
        { altitude: 2000, speed: 5, direction: 180, temperatureC: 18 },
      ],
    });
  });

  it('leaves the fields of missing conditions empty', () => {
    expect(draftOf(null, FEET)).toEqual({ temperature: null, jumpRun: null, winds: [] });
  });
});

describe('problemsOf', () => {
  const valid: ConditionsDraft = {
    temperature: 12,
    jumpRun: 90,
    winds: [{ altitude: 3000, speed: 8, direction: 270 }],
  };

  it('finds nothing in valid conditions', () => {
    expect(problemsOf(valid)).toEqual({});
    expect(problemsOf({ ...valid, jumpRun: 0 })).toEqual({});
    expect(problemsOf({ ...valid, jumpRun: 359 })).toEqual({});
  });

  it('keeps headings from 0 to 359 and whole', () => {
    expect(problemsOf({ ...valid, jumpRun: 360 })).toEqual({ jumpRun: 'heading' });
    expect(problemsOf({ ...valid, jumpRun: -5 })).toEqual({ jumpRun: 'heading' });
    expect(problemsOf({ ...valid, jumpRun: 12.5 })).toEqual({ jumpRun: 'heading' });
    expect(problemsOf({ ...valid, jumpRun: null })).toEqual({ jumpRun: 'required' });
  });

  it('asks for every field of a wind', () => {
    expect(
      problemsOf({ ...valid, temperature: null, winds: [...valid.winds, emptyWind()] })
    ).toEqual({ temperature: 'required', 'winds.1.altitude': 'required' });
    expect(problemsOf({ ...valid, winds: [{ altitude: -1, speed: -2, direction: 400 }] })).toEqual({
      'winds.0.altitude': 'negative',
      'winds.0.speed': 'negative',
      'winds.0.direction': 'heading',
    });
  });

  it('takes at most the maximum number of heights', () => {
    const winds = Array.from({ length: MAX_WINDS + 1 }, () => valid.winds[0]);
    expect(problemsOf({ ...valid, winds })).toEqual({ winds: 'tooMany' });
  });
});

describe('inputOf', () => {
  it('gives the API SI values, highest wind first, keeping the measured temperatures', () => {
    const input = inputOf(
      {
        temperature: 70,
        jumpRun: 245,
        winds: [
          { altitude: 2000, speed: 5, direction: 180 },
          { altitude: 14000, speed: 20, direction: 250, temperatureC: -12 },
        ],
      },
      { ...FEET, temperature: 'f' }
    );
    expect(input.jumpRun).toBe(245);
    expect(input.temperatureC).toBe(21.11);
    expect(JSON.parse(input.winds)).toEqual([
      { altitude_m: 4267.2, speed_mps: 10.29, direction: 250, temperature_c: -12 },
      { altitude_m: 609.6, speed_mps: 2.57, direction: 180 },
    ]);
  });

  it('round-trips the conditions in metric units', () => {
    const conditions = {
      jumpRun: 10,
      temperatureC: 5,
      winds: [{ altitudeM: 3000, speedMps: 7, direction: 300 }],
    };
    const input = inputOf(draftOf(conditions as never, METRES), METRES);
    expect(input.temperatureC).toBe(5);
    expect(JSON.parse(input.winds)).toEqual([{ altitude_m: 3000, speed_mps: 7, direction: 300 }]);
  });
});
