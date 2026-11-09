import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import LottieView from 'app/components/LottieView';
import lottieDoneAnimation from '../../../../../assets/images/finished-2.json';

const ANIMATION_SIZE = 300;

function Done(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  return (
    <Step {...props} title={t('operatorWizard.doneTitle')}>
      <Fields>
        <View
          style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
          aria-hidden
          importantForAccessibility="no-hide-descendants"
        >
          <LottieView
            loop={false}
            autoPlay
            speed={1.2}
            style={{ height: ANIMATION_SIZE, width: ANIMATION_SIZE }}
            source={lottieDoneAnimation as unknown as string}
          />
        </View>
      </Fields>
    </Step>
  );
}
export default Done;
