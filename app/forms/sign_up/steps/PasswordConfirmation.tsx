import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

function PasswordConfirmationStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext();
  return (
    <Step {...props} title={t('forms.sign_up.repeatPassword')}>
      <Fields>
        <FormTextField
          {...{ control }}
          label={t('forms.fields.password')}
          name="passwordConfirmation"
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
        />
      </Fields>
    </Step>
  );
}

export default PasswordConfirmationStep;
