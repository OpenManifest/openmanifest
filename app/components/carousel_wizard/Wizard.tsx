import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { Carousel, CarouselRef } from 'react-native-reanimated-carousel';
import { useNavigation } from '@react-navigation/native';
import { IWizardStepProps } from './Step';
import WizardFrame from './WizardFrame';
import Buttons from './Buttons';

export interface IWizardProps {
  dots?: boolean;
  currentIndex?: number;
  steps: (IWizardStepDefinition | null)[];
}

export interface IWizardStepDefinition {
  component: React.ComponentType<IWizardStepProps>;

  onNext?(navigation: ReturnType<typeof useNavigation>): Promise<void>;
  onBack?(): Promise<void> | void;
}

export type WizardRef = CarouselRef;

function Wizard(props: IWizardProps, ref: React.Ref<CarouselRef>) {
  const { steps, dots, currentIndex: outerIndex } = props;
  const [index, setIndex] = React.useState(0);
  const currentIndex = React.useMemo(() => {
    if (outerIndex !== undefined) return outerIndex;
    return index;
  }, [index, outerIndex]);
  const navigation = useNavigation();
  const carouselRef = React.useRef<CarouselRef>(null);

  React.useImperativeHandle(ref, () => ({
    next: () => carouselRef.current?.next(),
    prev: () => carouselRef.current?.prev(),
    getCurrentIndex: () => carouselRef.current?.getCurrentIndex() || 0,
    scrollTo: (opts) => carouselRef.current?.scrollTo(opts),
  }));

  const onNext = React.useCallback(
    async function WizardNextStep() {
      if (steps[currentIndex]?.onNext) {
        await steps[currentIndex]?.onNext?.(navigation);
      }
      if (currentIndex === steps.length - 1) {
        navigation.goBack();
      } else {
        carouselRef?.current?.next();
        setIndex(currentIndex + 1);
      }

      return undefined;
    },
    [currentIndex, navigation, steps]
  );

  const onBack = React.useCallback(
    async function WizardBackStep() {
      steps[currentIndex]?.onBack?.();
      if (currentIndex === 0) {
        navigation.goBack();
      } else {
        carouselRef?.current?.prev();
        setIndex(currentIndex - 1 || 0);
      }
      return undefined;
    },
    [currentIndex, navigation, steps]
  );

  return (
    <WizardFrame dotCount={dots ? steps.length : undefined} dotIndex={currentIndex}>
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
          renderItem={({ item, index }) => {
            if (!item) {
              return <View />;
            }
            const { component: Step } = item;
            return (
              <Step
                actions={
                  <Buttons
                    isCurrent={index === currentIndex}
                    nextLabel={currentIndex === steps.length - 1 ? 'Done' : 'Next'}
                    backLabel="Back"
                    onNext={onNext}
                    onBack={onBack}
                  />
                }
              />
            );
          }}
        />
      )}
    </WizardFrame>
  );
}

export default React.forwardRef(Wizard);
