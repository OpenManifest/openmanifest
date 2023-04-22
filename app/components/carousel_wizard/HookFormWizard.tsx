import * as React from 'react';

import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  LayoutRectangle,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { useNavigation } from '@react-navigation/core';
import { Step } from './Step';
import Dots from './Dots';
import Buttons from './Buttons';
import type { IUseWizardReturnValue } from 'app/hooks/forms';
import { FormProvider, useWatch } from 'react-hook-form';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useEffect, useMemo } from 'app/hooks/react';

export interface IHookFormWizardProps<HookFormWizardSteps extends WizardFormStep[]>
  extends IUseWizardReturnValue<HookFormWizardSteps>,
    ReturnType<IUseWizardReturnValue<HookFormWizardSteps>['createHandlers']> {
  dots?: boolean;
  steps: typeof Step[];
}

export type WizardRef = ICarouselInstance;

function Wizard<WizardSteps extends WizardFormStep[]>(
  props: IHookFormWizardProps<WizardSteps>,
  ref: React.Ref<ICarouselInstance>
) {
  const { dots, steps, ...form } = props;
  const { control, loading, setMaxIndex, setIndex, next, back } = form;
  const { stepIndex: step, lastStepIndex } = useWatch({ control });
  const currentIndex = useMemo(() => step || 0, [step]);

  const [dimensions, setDimensions] = React.useState<LayoutRectangle>({
    width: 0,
    height: 0,
    x: 0,
    y: 0
  });
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const screen = useWindowDimensions();

  React.useImperativeHandle(ref, () => ({
    next: () => carouselRef.current?.next(),
    prev: () => carouselRef.current?.prev(),
    getCurrentIndex: () => carouselRef.current?.getCurrentIndex() || 0,
    scrollTo: (opts) => carouselRef.current?.scrollTo(opts)
  }));

  useEffect(() => {
    if (currentIndex !== carouselRef?.current?.getCurrentIndex()) {
      carouselRef?.current?.scrollTo({ animated: true, index: currentIndex });
    }
  }, [currentIndex]);

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setDimensions(event.nativeEvent.layout);
  }, []);

  const { width } = dimensions;

  useEffect(() => {
    if (lastStepIndex !== (steps?.length || 0)) {
      setMaxIndex(steps?.length || 0);
    }
  }, [lastStepIndex, setMaxIndex, steps]);

  return (
    <FormProvider {...form}>
      <KeyboardAvoidingView
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
        {...{ onLayout }}
      >
        {!dots ? null : (
          <View style={styles.dots}>
            <Dots count={lastStepIndex || 0} index={currentIndex} />
          </View>
        )}
        <Carousel
          autoPlay={false}
          loop={false}
          modeConfig={{ parallaxScrollingScale: 1, parallaxScrollingOffset: 32 }}
          pagingEnabled={false}
          enabled={false}
          panGestureHandlerProps={{
            // Disable swiping
            activeOffsetX: [-width, width]
          }}
          mode="parallax"
          style={StyleSheet.absoluteFill}
          data={steps}
          width={width || screen.width}
          onSnapToItem={setIndex}
          ref={carouselRef}
          renderItem={({ item: WizardStep }) => {
            if (!WizardStep) {
              return <View />;
            }
            return (
              <WizardStep
                actions={
                  <Buttons
                    {...{ loading }}
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
      </KeyboardAvoidingView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  dots: {
    alignSelf: 'center',
    minWidth: 400,
    maxWidth: 500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    zIndex: 1100
  },
  actions: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 48
  },
  next: {
    width: '100%',
    borderRadius: 20,
    minWidth: 300
  },
  content: {
    flexGrow: 1
  }
});

export default React.forwardRef(Wizard);
