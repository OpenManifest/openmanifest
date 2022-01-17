import checkPasswordComplexity, { PasswordStrength } from '../checkPasswordComplexity';

describe('PasswordComplexity', () => {
  test('Upper case only should fail', () => {
    expect(checkPasswordComplexity('ONLYUPPERCASE')).toBe(PasswordStrength.TooWeak);
  });

  test('Lowercase only should fail', () => {
    expect(checkPasswordComplexity('onlylowercase')).toBe(PasswordStrength.TooWeak);
  });

  test('Uppercase with one number', () => {
    expect(checkPasswordComplexity('ONLYUPCASE1')).toBe(PasswordStrength.Weak);
  });

  test('Lowercase with one number', () => {
    expect(checkPasswordComplexity('lowercase5')).toBe(PasswordStrength.Weak);
  });

  test('Uppercase, lowercase, digit', () => {
    expect(checkPasswordComplexity('Upcase12')).toBe(PasswordStrength.Weak);
  });

  test('Uppercase, lowercase, digit, special character', () => {
    expect(checkPasswordComplexity('RaNdOmMix13!%')).toBe(PasswordStrength.Acceptable);
  });

  test('Uppercase, lowercase, digit, special character', () => {
    expect(checkPasswordComplexity('raNdOmMix13!%')).toBe(PasswordStrength.Acceptable);
  });

  test('Lowercase, digit, special character', () => {
    expect(checkPasswordComplexity('lowercase3!]')).toBe(PasswordStrength.Acceptable);
  });
});
