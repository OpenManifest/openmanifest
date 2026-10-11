import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { Carousel, CarouselRef } from 'react-native-reanimated-carousel';
import { useNavigation } from '@react-navigation/native';
import { Step } from './Step';
import WizardFrame from './WizardFrame';
import Buttons from './Buttons';
import type { IUseWizardReturnValue } from 'app/hooks/forms';
import { FormProvider, useWatch } from 'react-hook-form';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useEffect, useMemo } from 'app/hooks/react';

export interface IHookFormWizardProps<HookFormWizardSteps extends WizardFormStep[]>
  extends
    IUseWizardReturnValue<HookFormWizardSteps>,
    ReturnType<IUseWizardReturnValue<HookFormWizardSteps>['createHandlers']> {
  dots?: boolean;
  steps: (typeof Step)[];
}

export type WizardRef = CarouselRef;

function Wizard<WizardSteps extends WizardFormStep[]>(
  props: IHookFormWizardProps<WizardSteps>,
  ref: React.Ref<CarouselRef>
) {
  const { dots, steps, ...form } = props;
  const { control, loading, setMaxIndex, setIndex, next, back } = form;
  const { stepIndex: step, lastStepIndex } = useWatch({ control });
  const currentIndex = useMemo(() => step || 0, [step]);

  const carouselRef = React.useRef<CarouselRef>(null);

  React.useImperativeHandle(ref, () => ({
    next: () => carouselRef.current?.next(),
    prev: () => carouselRef.current?.prev(),
    getCurrentIndex: () => carouselRef.current?.getCurrentIndex() || 0,
    scrollTo: (opts) => carouselRef.current?.scrollTo(opts),
  }));

  useEffect(() => {
    if (currentIndex !== carouselRef?.current?.getCurrentIndex()) {
      carouselRef?.current?.scrollTo({ animated: true, index: currentIndex });
    }
  }, [currentIndex]);

  useEffect(() => {
    if (lastStepIndex !== (steps?.length || 0)) {
      setMaxIndex(steps?.length || 0);
    }
  }, [lastStepIndex, setMaxIndex, steps]);

  return (
    <FormProvider {...form}>
      <WizardFrame dotCount={dots ? lastStepIndex || 0 : undefined} dotIndex={currentIndex}>
        {(pageWidth) => (
          <Carousel
            autoplay={false}
            loop={false}
            layout={{ type: 'parallax', scale: 1, offset: 32 }}
            // The steps are changed with the buttons, not by swiping
            scrollEnabled={false}
            style={StyleSheet.absoluteFill}
            data={steps}
            itemSize={pageWidth}
            onSnapToItem={setIndex}
            ref={carouselRef}
            renderItem={({ item: WizardStep, index }) => {
              if (!WizardStep) {
                return <View />;
              }
              return (
                <WizardStep
                  actions={
                    <Buttons
                      {...{ loading }}
                      isCurrent={index === currentIndex}
                      nextLabel={currentIndex === lastStepIndex ? 'Done' : 'Next'}
                      backLabel="Back"
                      onNext={next}
                      onBack={back}
                    />
                  }
                />
              );
            }}
          />
        )}
      </WizardFrame>
    </FormProvider>
  );
}

export default React.forwardRef(Wizard);
