import { useIsFocused } from '@react-navigation/core';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import GradientText from '../GradientText';

export interface IWizardStepProps {
  title?: React.ReactText;
  children?: React.ReactNode;
  hideContentUntilNavigatedTo?: boolean;
}

export function Fields({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={styles.fields}
      behavior={Platform.OS === 'android' ? undefined : 'padding'}
    >
      <View style={styles.fieldContent}>{children}</View>
    </KeyboardAvoidingView>
  );
}
export function Step(props: IWizardStepProps) {
  const { children, title, hideContentUntilNavigatedTo } = props;

  const isFocused = useIsFocused();
  if (!isFocused && hideContentUntilNavigatedTo) {
    return null;
  }
  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.title}>
          <View>
            <GradientText
              style={{
                marginTop: 16,
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: 72,
              }}
            >
              {title}
            </GradientText>
          </View>
        </View>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    minWidth: 400,
    maxWidth: 500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  title: {
    minWidth: 400,
    maxWidth: 500,
    alignSelf: 'center',
    paddingLeft: 32,
  },
  fields: {
    minWidth: 400,
    maxWidth: 500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fieldContent: {
    flexDirection: 'column',
    flexGrow: 1,
  },
});
