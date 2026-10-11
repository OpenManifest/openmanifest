import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientText from '../GradientText';
import FormColumn from '../layout/FormColumn';
import { useAppTheme } from 'app/theme';

export const WIZARD_MAX_WIDTH = 400;
/** Keeps the focused input above the buttons that rise with the keyboard */
const ACTIONS_CLEARANCE = 128;

export interface IWizardStepProps {
  title?: string | number;
  children?: React.ReactNode;
  actions: React.ReactNode;
  hideContentUntilNavigatedTo?: boolean;
}

export function Fields({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.fields}>
      <View style={styles.fieldContent}>{children}</View>
    </View>
  );
}
export function Step(props: IWizardStepProps) {
  const { children, title, actions, hideContentUntilNavigatedTo } = props;
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const isFocused = useIsFocused();
  if (!isFocused && hideContentUntilNavigatedTo) {
    return null;
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FormColumn bottomOffset={ACTIONS_CLEARANCE} contentContainerStyle={styles.content}>
        {title ? (
          <View style={styles.title}>
            <GradientText numberOfLines={1} adjustsFontSizeToFit style={styles.titleText}>
              {title}
            </GradientText>
          </View>
        ) : null}
        <View style={styles.children}>{children}</View>
      </FormColumn>

      {/* The keyboard height includes the bottom inset, which the container already pads */}
      <KeyboardStickyView
        offset={{ closed: 0, opened: insets.bottom }}
        style={{ backgroundColor: theme.colors.background }}
      >
        {actions}
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  title: {
    width: '100%',
    maxWidth: WIZARD_MAX_WIDTH,
    alignSelf: 'center',
    marginBottom: 24,
  },
  titleText: {
    marginTop: 16,
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 36,
    lineHeight: 44,
  },
  children: {
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fields: {
    width: '100%',
    maxWidth: WIZARD_MAX_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  fieldContent: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
  },
});
