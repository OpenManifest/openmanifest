import * as React from 'react';
import { useController } from 'react-hook-form';
import { HelperText } from 'react-native-paper';
import FederationCardSelect from 'app/components/input/card_select/FederationCardSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { useDropzoneWizardFields } from '../useDropzoneWizardForm';

function Federation(props: IWizardStepProps) {
  const { control, setField } = useDropzoneWizardFields();
  const { field, fieldState } = useController({ name: 'federation', control });

  return (
    <Step {...props} title="Affiliation">
      <Fields>
        <FederationCardSelect
          value={field.value}
          onSelect={(value) => setField('federation', value)}
        />
        <HelperText type={fieldState.error?.message ? 'error' : 'info'}>
          {fieldState.error?.message || ''}
        </HelperText>
      </Fields>
    </Step>
  );
}
export default Federation;
