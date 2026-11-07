import { limitsModule } from '../limits';
import { isIsoDate } from 'app/forms/user_wizard/steps/DateOfBirth';

describe('limitsModule', () => {
  it('is what the operator watches, and nothing when the module is off', () => {
    expect(limitsModule({ limits: { mass: true, payload: true, age: true } })).toEqual({
      age: true,
      mass: true,
      payload: true,
    });
    expect(limitsModule({ limits: { mass: true } })).toEqual({
      age: false,
      mass: true,
      payload: false,
    });
    expect(limitsModule({})).toBeNull();
    expect(limitsModule(null)).toBeNull();
  });
});

describe('isIsoDate', () => {
  it('accepts a date that exists as YYYY-MM-DD', () => {
    expect(isIsoDate('1990-02-28')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
  });

  it('refuses anything else', () => {
    expect(isIsoDate('1990-02-30')).toBe(false);
    expect(isIsoDate('28/02/1990')).toBe(false);
    expect(isIsoDate('')).toBe(false);
    expect(isIsoDate(null)).toBe(false);
  });
});
