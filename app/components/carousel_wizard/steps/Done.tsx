import * as React from 'react';
import { View } from 'react-native';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import LottieView from 'app/components/LottieView';
import lottieDoneAnimation from '../../../../assets/images/finished-2.json';

function Done(props: IWizardStepProps) {
  return (
    <Step {...props} title="Profile updated">
      <Fields>
        <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LottieView
            loop={false}
            autoPlay
            speed={1.2}
            style={{ height: 300, width: 300 }}
            source={lottieDoneAnimation as unknown as string}
          />
        </View>
      </Fields>
    </Step>
  );
}
export default Done;
