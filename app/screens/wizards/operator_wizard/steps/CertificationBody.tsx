import * as React from 'react';
import { useController } from 'react-hook-form';
import { HelperText } from 'react-native-paper';
import CertificationBodyChipSelect from 'app/components/input/chip_select/CertificationBodyChipSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { useOperatorWizardFields } from '../useOperatorWizardForm';

function CertificationBody(props: IWizardStepProps) {
  const { control, setField } = useOperatorWizardFields();
  const { field, fieldState } = useController({ name: 'certificationBodies', control });

  return (
    <Step {...props} title="Affiliation">
      <Fields>
        <CertificationBodyChipSelect
          value={field.value}
          onChange={(bodies) => setField('certificationBodies', bodies)}
        />
        <HelperText type={fieldState.error?.message ? 'error' : 'info'}>
          {fieldState.error?.message || ''}
        </HelperText>
      </Fields>
    </Step>
  );
}
export default CertificationBody;
