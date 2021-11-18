import checkPasswordComplexity from '../checkPasswordComplexity';

describe('PasswordComplexity', () => {
  test('Upper case only should fail', () => {
    expect(checkPasswordComplexity('ONLYUPPERCASE')).toBe(false);
  });

  test('Lowercase only should fail', () => {
    expect(checkPasswordComplexity('onlylowercase')).toBe(false);
  });

  test('Uppercase with one number', () => {
    expect(checkPasswordComplexity('ONLYUPCASE1')).toBe(false);
  });

  test('Lowercase with one number', () => {
    expect(checkPasswordComplexity('lowercase5')).toBe(false);
  });

  test('Uppercase, lowercase, digit', () => {
    expect(checkPasswordComplexity('Upcase12')).toBe(false);
  });

  test('Uppercase, lowercase, digit, special character', () => {
    expect(checkPasswordComplexity('RaNdOmMix13!%')).toBe(true);
  });

  test('Uppercase, lowercase, digit, special character', () => {
    expect(checkPasswordComplexity('raNdOmMix13!%')).toBe(true);
  });

  test('Lowercase, digit, special character', () => {
    expect(checkPasswordComplexity('lowercase3!]')).toBe(true);
  });
});
