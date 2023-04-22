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
import { IWizardStepProps } from './Step';
import Dots from './Dots';
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

export type WizardRef = ICarouselInstance;

function Wizard(props: IWizardProps, ref: React.Ref<ICarouselInstance>) {
  const { steps, dots, currentIndex: outerIndex } = props;
  const [index, setIndex] = React.useState(0);
  const currentIndex = React.useMemo(() => {
    if (outerIndex !== undefined) return outerIndex;
    return index;
  }, [index, outerIndex]);
  const navigation = useNavigation();
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

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setDimensions(event.nativeEvent.layout);
  }, []);

  const { width, height } = dimensions;

  return (
    <KeyboardAvoidingView
      style={StyleSheet.absoluteFill}
      behavior={Platform.OS === 'android' ? undefined : 'padding'}
      {...{ onLayout }}
    >
      {!dots ? null : (
        <View style={styles.dots}>
          <Dots count={steps.length} index={currentIndex} />
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
        renderItem={({ item }) => {
          if (!item) {
            return <View />;
          }
          const { component: Step } = item;
          return (
            <Step
              actions={
                <Buttons
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
    </KeyboardAvoidingView>
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
