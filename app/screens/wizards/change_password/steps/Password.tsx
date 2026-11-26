import * as React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import PasswordComplexityIndicator from 'app/components/input/PasswordComplexityIndicator';
import checkPasswordComplexity from 'app/utils/checkPasswordComplexity';
import { useChangePasswordFields } from '../fields';

function PasswordStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { values, errors, setValue } = useChangePasswordFields();
  return (
    <Step {...props} title={t('auth.change.title')}>
      <Fields>
        <TextInput
          label={t('auth.change.newPassword')}
          error={errors.password}
          textContentType="newPassword"
          autoComplete="new-password"
          secureTextEntry
          value={values.password}
          onChangeText={(newValue) => setValue('password', newValue)}
        />
        <PasswordComplexityIndicator strength={checkPasswordComplexity(values.password)} />
      </Fields>
    </Step>
  );
}

export default PasswordStep;
