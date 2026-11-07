import * as React from 'react';
import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TextInput from 'app/components/input/text/TextField';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { useOperatorWizardFields } from '../useOperatorWizardForm';

function Name(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control, setField } = useOperatorWizardFields();
  const { field, fieldState } = useController({ name: 'name', control });

  return (
    <Step {...props} title={t('operatorWizard.nameTitle')}>
      <Fields>
        <TextInput
          label={t('operatorWizard.name')}
          error={fieldState.error?.message}
          value={field.value}
          onChange={(newValue) => setField('name', newValue)}
        />
      </Fields>
    </Step>
  );
}
export default Name;
