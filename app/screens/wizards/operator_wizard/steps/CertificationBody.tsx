import * as React from 'react';
import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CertificationBodyChipSelect from 'app/components/input/chip_select/CertificationBodyChipSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { FieldError } from 'app/ui';
import { useOperatorWizardFields } from '../useOperatorWizardForm';

function CertificationBody(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control, setField } = useOperatorWizardFields();
  const { field, fieldState } = useController({ name: 'certificationBodies', control });

  return (
    <Step {...props} title={t('operatorWizard.affiliationTitle')}>
      <Fields>
        <CertificationBodyChipSelect
          value={field.value}
          onChange={(bodies) => setField('certificationBodies', bodies)}
        />
        <FieldError>{fieldState.error?.message}</FieldError>
      </Fields>
    </Step>
  );
}
export default CertificationBody;
