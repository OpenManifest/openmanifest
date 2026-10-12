import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

function EmailStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext();
  return (
    <Step {...props} title={t('forms.fields.email')}>
      <Fields>
        <FormTextField {...{ control }} name="email" label={t('forms.fields.email')} />
      </Fields>
    </Step>
  );
}

export default EmailStep;
