import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import PasswordComplexityIndicator from 'app/components/input/PasswordComplexityIndicator';
import checkPasswordComplexity from 'app/utils/checkPasswordComplexity';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

function PasswordStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext();
  const { password } = useWatch({ control });
  return (
    <Step {...props} title={t('forms.fields.password')}>
      <Fields>
        <FormTextField
          name="password"
          {...{ control }}
          label={t('forms.fields.password')}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
        />
        <PasswordComplexityIndicator strength={checkPasswordComplexity(password)} />
      </Fields>
    </Step>
  );
}

export default PasswordStep;
