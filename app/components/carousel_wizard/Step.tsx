import { useIsFocused } from '@react-navigation/core';
import { useAppSelector } from 'app/state';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import GradientText from '../GradientText';

export interface IWizardStepProps {
  title?: string;
  children?: React.ReactNode;
  actions: React.ReactNode;
  hideContentUntilNavigatedTo?: boolean;
}

export function Fields({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView style={styles.fields} behavior={Platform.OS === 'android' ? undefined : 'padding'}>
      <View style={styles.fieldContent}>{children}</View>
    </KeyboardAvoidingView>
  );
}
export function Step(props: IWizardStepProps) {
  const { children, title, actions, hideContentUntilNavigatedTo } = props;
  const theme = useAppSelector((state) => state.global.theme);

  const isFocused = useIsFocused();
  if (!isFocused && hideContentUntilNavigatedTo) {
    return null;
  }
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {title && (
        <View style={styles.title}>
          <View>
            <GradientText
              style={{
                marginTop: 16,
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: 72
              }}
            >
              {title}
            </GradientText>
          </View>
        </View>
      )}
      <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>{children}</View>

      {actions}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column'
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  title: {
    minWidth: 400,
    maxWidth: 500,
    alignSelf: 'center',
    paddingLeft: 32,
    marginBottom: 56
  },
  fields: {
    minWidth: 400,
    maxWidth: 500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  fieldContent: {
    flexDirection: 'column',
    flexGrow: 1
  }
});
