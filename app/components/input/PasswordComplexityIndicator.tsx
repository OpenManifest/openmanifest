import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProgressMeter } from 'app/ui';
import { PasswordStrength } from '../../utils/checkPasswordComplexity';

interface IPasswordComplexityIndicatorProps {
  strength: PasswordStrength;
}

const WORDS = [
  'password.tooWeak',
  'password.weak',
  'password.acceptable',
  'password.strong',
] as const;

/** How strong a password is, in a bar and in words: too weak and weak are blocked, acceptable a warning, strong ok */
function PasswordStep({ strength }: IPasswordComplexityIndicatorProps) {
  const { t } = useTranslation('common');

  return (
    <ProgressMeter
      label={t('password.strength')}
      value={strength + 1}
      max={WORDS.length}
      valueText={t(WORDS[strength])}
      tone={
        strength < PasswordStrength.Acceptable
          ? 'blocked'
          : strength === PasswordStrength.Acceptable
            ? 'warning'
            : 'ok'
      }
    />
  );
}

export default PasswordStep;
