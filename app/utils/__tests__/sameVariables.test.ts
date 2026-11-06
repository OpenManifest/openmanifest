import sameVariables from '../sameVariables';

describe('sameVariables', () => {
  it('treats an undefined variable and an absent one as equal (Apollo 3.14 drops undefined variables)', () => {
    expect(sameVariables({ state: undefined }, {})).toBe(true);
    expect(sameVariables({}, { state: undefined })).toBe(true);
    expect(sameVariables({ state: undefined }, undefined)).toBe(true);
  });

  it('is equal for the same values and different for changed or extra values', () => {
    expect(
      sameVariables({ operator: '1', date: '2026-10-08' }, { date: '2026-10-08', operator: '1' })
    ).toBe(true);
    expect(sameVariables({ operator: '1' }, { operator: '2' })).toBe(false);
    expect(sameVariables({ operator: '1' }, {})).toBe(false);
    expect(sameVariables({ state: null }, {})).toBe(false);
  });
});
