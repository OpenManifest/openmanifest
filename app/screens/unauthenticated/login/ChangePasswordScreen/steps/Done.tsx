import * as React from 'react';
import { Paragraph } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard/Step';

function DoneStep(props: IWizardStepProps) {
  return (
    <Step {...props} title="Password changed">
      <Fields>
        <Paragraph>Your password has been changed. You can now log in again.</Paragraph>
      </Fields>
    </Step>
  );
}

export default DoneStep;
