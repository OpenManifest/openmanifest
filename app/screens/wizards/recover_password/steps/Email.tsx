import * as React from 'react';
import { useTranslation } from 'react-i18next';
import TextInput from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useRecoverPasswordFields } from '../fields';

function EmailStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { values, errors, setValue } = useRecoverPasswordFields();
  return (
    <Step {...props} title={t('auth.recover.title')}>
      <Fields>
        <TextInput
          label={t('auth.email')}
          value={values.email}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          onChangeText={(newText) => setValue('email', newText)}
        />
      </Fields>
    </Step>
  );
}

export default EmailStep;
