import * as React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useChangePasswordFields } from '../fields';

function PasswordConfirmationStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { values, errors, setValue } = useChangePasswordFields();
  return (
    <Step {...props} title={t('auth.change.repeatTitle')}>
      <Fields>
        <TextInput
          label={t('auth.change.repeatPassword')}
          error={errors.passwordConfirmation}
          textContentType="newPassword"
          autoComplete="new-password"
          secureTextEntry
          value={values.passwordConfirmation}
          onChangeText={(newValue) => setValue('passwordConfirmation', newValue)}
        />
      </Fields>
    </Step>
  );
}

export default PasswordConfirmationStep;
