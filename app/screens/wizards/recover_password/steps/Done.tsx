import * as React from 'react';
import { Paragraph } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard/Step';

function DoneStep(props: IWizardStepProps) {
  return (
    <Step {...props} title="Check your email">
      <Fields>
        <Paragraph>We've sent you a link to restore your password.</Paragraph>
      </Fields>
    </Step>
  );
}

export default DoneStep;
