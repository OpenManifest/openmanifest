/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { useAppSelector } from 'app/state';
import { IWizardStepProps } from './Step';
import Dots from './Dots';

export interface IWizardProps {
  dots?: boolean;
  steps: (IWizardStepDefinition | null)[];
}

export interface IWizardStepDefinition {
  component: React.ComponentType<IWizardStepProps>;
  onNext?(navigation: ReturnType<typeof useNavigation>): Promise<void>;
  onBack?(): Promise<void> | void;
}

export type WizardRef = ICarouselInstance;

function Wizard(props: IWizardProps, ref: React.Ref<ICarouselInstance>) {
  const { steps, dots } = props;
  const [currentIndex, setIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const navigation = useNavigation();
  const { palette } = useAppSelector((root) => root.global);
  const { width } = useWindowDimensions();
  const carouselRef = React.useRef<ICarouselInstance>(null);

  React.useImperativeHandle(ref, () => ({
    next: () => carouselRef.current?.next(),
    prev: () => carouselRef.current?.prev(),
    getCurrentIndex: () => carouselRef.current?.getCurrentIndex() || 0,
    scrollTo: (opts) => carouselRef.current?.scrollTo(opts),
  }));

  return (
    <View style={{ ...StyleSheet.absoluteFillObject }}>
      {!dots ? null : (
        <View style={styles.dots}>
          <Dots count={steps.length} index={currentIndex} />
        </View>
      )}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
      >
        <Carousel
          autoPlay={false}
          loop={false}
          modeConfig={{ parallaxScrollingScale: 1, parallaxScrollingOffset: 32 }}
          pagingEnabled={false}
          enabled={false}
          panGestureHandlerProps={{
            // Disable swiping
            activeOffsetX: [-width, width],
          }}
          style={{ height: '80%' }}
          mode="parallax"
          data={steps}
          width={width}
          onSnapToItem={setIndex}
          ref={carouselRef}
          renderItem={({ item }) => {
            if (!item) {
              return <View />;
            }
            const { component: Step } = item;
            return <Step />;
          }}
        />
        <View style={styles.actions}>
          <Button
            disabled={loading}
            loading={loading}
            onPress={async () => {
              try {
                if (steps[currentIndex]?.onNext) {
                  setLoading(true);
                  await steps[currentIndex]?.onNext?.(navigation);
                }
                if (currentIndex === steps.length - 1) {
                  navigation.goBack();
                } else {
                  carouselRef?.current?.next();
                  setIndex(currentIndex + 1);
                }
              } catch {
                return undefined;
              } finally {
                setLoading(false);
              }

              return undefined;
            }}
            style={[styles.next, { backgroundColor: palette.placeholder }]}
            mode="contained"
          >
            {currentIndex === steps.length - 1 ? 'Done' : 'Next'}
          </Button>
          <Button
            disabled={loading}
            mode="text"
            onPress={async () => {
              steps[currentIndex]?.onBack?.();
              if (currentIndex === 0) {
                navigation.goBack();
              } else {
                carouselRef?.current?.prev();
                setIndex(currentIndex - 1 || 0);
              }
              return undefined;
            }}
          >
            Back
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
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
    padding: 48,
  },
  actions: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 48,
  },
  next: {
    width: '100%',
    borderRadius: 20,
    minWidth: 300,
  },
  content: {
    flexGrow: 1,
  },
});

export default React.forwardRef(Wizard);
