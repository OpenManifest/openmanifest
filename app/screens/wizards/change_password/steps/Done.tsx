import * as React from 'react';
import { Paragraph } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import LottieView from 'app/components/LottieView';
import lottieDoneAnimation from '../../../../../assets/images/finished-2.json';

function DoneStep(props: IWizardStepProps) {
  return (
    <Step {...props} title="Password changed">
      <Fields>
        <LottieView
          loop={false}
          autoPlay
          speed={1.2}
          style={{ height: 300, width: 300, alignSelf: 'center' }}
          source={lottieDoneAnimation as unknown as string}
        />
        <Paragraph>Your password has been changed. You can now log in again.</Paragraph>
      </Fields>
    </Step>
  );
}

export default DoneStep;
