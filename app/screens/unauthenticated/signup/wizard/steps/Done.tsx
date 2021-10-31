import * as React from 'react';
import { Paragraph } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard/Step';

function DoneStep(props: IWizardStepProps) {
  return (
    <Step {...props} title="Check your email">
      <Fields>
        <Paragraph>Click the link in the email we sent to you to confirm your account.</Paragraph>
      </Fields>
    </Step>
  );
}

export default DoneStep;
