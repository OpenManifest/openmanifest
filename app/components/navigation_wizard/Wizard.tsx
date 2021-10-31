import * as React from 'react';
import {
  createStackNavigator,
  HeaderStyleInterpolators,
  TransitionSpecs,
} from '@react-navigation/stack';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { IWizardStepProps } from './Step';
import Dots from './Dots';

const WizardRoot = createStackNavigator();
const WizardModal = createStackNavigator();

export interface IWizardProps {
  name: string;
  dots?: boolean;
  steps: IWizardStepDefinition[];
}

export interface IWizardStepDefinition {
  component: React.ComponentType<IWizardStepProps>;
  onNext?(): Promise<void>;
}
export function Content(props: IWizardProps) {
  const { name, steps, dots } = props;
  const [currentIndex, setIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const navigation = useNavigation();

  return (
    <View style={StyleSheet.absoluteFill}>
      {!dots ? null : (
        <View style={styles.dots}>
          <Dots count={steps.length} index={currentIndex} />
        </View>
      )}
      <KeyboardAvoidingView style={styles.content} behavior="padding">
        <WizardRoot.Navigator
          screenOptions={{
            headerShown: false,
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
            headerStyleInterpolator: HeaderStyleInterpolators.forFade,
            cardStyleInterpolator: ({ current, next, layouts }) => {
              return {
                cardStyle: {
                  backgroundColor: 'transparent',
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                    {
                      scale: next
                        ? next.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.9],
                          })
                        : 1,
                    },
                  ],
                },
                overlayStyle: {
                  opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                  }),
                },
              };
            },
          }}
        >
          {steps.map(({ component: Step }, index) => (
            <WizardRoot.Screen name={`${name}${index}`}>
              {(screenProps) => <Step {...screenProps} {...{ index }} />}
            </WizardRoot.Screen>
          ))}
        </WizardRoot.Navigator>
        <View style={styles.actions}>
          <Button
            disabled={loading}
            loading={loading}
            onPress={async () => {
              try {
                if (steps[currentIndex].onNext) {
                  setLoading(true);
                  await steps[currentIndex].onNext?.();
                }
                if (currentIndex === steps.length - 1) {
                  navigation.goBack();
                } else {
                  navigation.navigate(`${name}${currentIndex + 1}`);
                  setIndex(currentIndex + 1);
                }
              } catch {
                return undefined;
              } finally {
                setLoading(false);
              }

              return undefined;
            }}
            style={styles.next}
            mode="contained"
          >
            {currentIndex === steps.length - 1 ? 'Done' : 'Next'}
          </Button>
          <Button
            disabled={loading}
            mode="text"
            onPress={async () => {
              if (currentIndex === 0) {
                navigation.goBack();
              } else {
                navigation.navigate(`${name}${currentIndex - 1}`);
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

export function Wizard(props: IWizardProps) {
  const { name } = props;
  return (
    <WizardModal.Navigator mode="modal" screenOptions={{ headerShown: false }}>
      <WizardModal.Screen {...{ name }}>{() => <Content {...props} />}</WizardModal.Screen>
    </WizardModal.Navigator>
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

export default Wizard;