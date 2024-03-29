import { passwordStrength } from 'check-password-strength';

export enum PasswordStrength {
  TooWeak = 0,
  Weak = 1,
  Acceptable = 2,
  Strong = 3,
}
export default function checkPasswordComplexity(password: string) {
  const score = passwordStrength<PasswordStrength>(password, [
    { value: PasswordStrength.TooWeak, id: 0, minDiversity: 0, minLength: 0 },
    { value: PasswordStrength.Weak, id: 1, minDiversity: 2, minLength: 8 },
    { value: PasswordStrength.Acceptable, id: 2, minDiversity: 3, minLength: 10 },
    { value: PasswordStrength.Strong, id: 3, minDiversity: 4, minLength: 16 },
  ]);
  return score.value;
}
