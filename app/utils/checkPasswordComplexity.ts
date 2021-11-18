// Calculate password entropy for what would otherwise be
// the minimum required entropy:
// - 1 uppercase (26)
// - 1 lowercase (26)
// - 1 digit (10)
const entropy = {
  uppercase: 26,
  lowercase: 26,
  digit: 10,
  specials: 32,
};

export const minimumEntropy = (entropy.uppercase + entropy.lowercase + entropy.digit) ** 10;

export function calculateComplexity(password: string) {
  const charsetLength = [
    password.split('').some((character) => /[A-Z]/.test(character)) ? entropy.uppercase : 0,
    password.split('').some((character) => /[a-z]/.test(character)) ? entropy.lowercase : 0,
    password.split('').some((character) => /[0-9]/.test(character)) ? entropy.digit : 0,
    password.split('').some((character) => /\W/.test(character)) ? entropy.specials : 0,
  ].reduce((a, b) => a + b, 0);
  return charsetLength ** password.length;
}

export enum PasswordStrength {
  weak,
  ok,
  strong,
}

export function getPasswordStrength(password: string) {
  const passwordEntropy = calculateComplexity(password);

  if (passwordEntropy < minimumEntropy) {
    return PasswordStrength.weak;
  }

  if (passwordEntropy > minimumEntropy && passwordEntropy < minimumEntropy * 3) {
    return PasswordStrength.ok;
  }
  return PasswordStrength.strong;
}

export default function checkPasswordComplexity(password: string) {
  const passwordEntropy = calculateComplexity(password);

  return Number(passwordEntropy - minimumEntropy) > 0;
}
