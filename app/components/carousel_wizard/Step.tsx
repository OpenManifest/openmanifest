import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useStyles, useTheme, type Theme } from 'app/ui';
import FormColumn from '../layout/FormColumn';
import { WIZARD_MAX_WIDTH } from './constants';

export { WIZARD_MAX_WIDTH };
/** Keeps the focused input above the buttons that rise with the keyboard */
const ACTIONS_CLEARANCE = 128;

export interface IWizardStepProps {
  title?: string | number;
  children?: React.ReactNode;
  actions: React.ReactNode;
  hideContentUntilNavigatedTo?: boolean;
}

/** The column of fields of a wizard page */
export function Fields({ children }: { children: React.ReactNode }) {
  const styles = useStyles(stylesFor);
  return (
    <View style={styles.fields}>
      <View style={styles.fieldContent}>{children}</View>
    </View>
  );
}

/** A page of a wizard: its title (the page's heading), its content and the actions that stay above the keyboard */
export function Step(props: IWizardStepProps) {
  const { children, title, actions, hideContentUntilNavigatedTo } = props;
  const theme = useTheme();
  const styles = useStyles(stylesFor);
  const insets = useSafeAreaInsets();

  const isFocused = useIsFocused();
  if (!isFocused && hideContentUntilNavigatedTo) {
    return null;
  }
  return (
    <View style={styles.container}>
      <FormColumn bottomOffset={ACTIONS_CLEARANCE} contentContainerStyle={styles.content}>
        {title ? (
          <View style={styles.title}>
            <Text variant="title" role="heading" aria-level={1} numberOfLines={2}>
              {String(title)}
            </Text>
          </View>
        ) : null}
        <View style={styles.children}>{children}</View>
      </FormColumn>

      {/* The keyboard height includes the bottom inset, which the container already pads */}
      <KeyboardStickyView
        offset={{ closed: 0, opened: insets.bottom }}
        style={{ backgroundColor: theme.colour.app }}
      >
        {actions}
      </KeyboardStickyView>
    </View>
  );
}

const stylesFor = (theme: Theme) => ({
  container: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'column' as const,
    backgroundColor: theme.colour.app,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center' as const,
    justifyContent: 'space-evenly' as const,
  },
  title: {
    width: '100%' as const,
    maxWidth: WIZARD_MAX_WIDTH,
    alignSelf: 'center' as const,
    marginTop: theme.space.lg,
    marginBottom: theme.space.xl,
  },
  children: {
    width: '100%' as const,
    flexGrow: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  fields: {
    width: '100%' as const,
    maxWidth: WIZARD_MAX_WIDTH,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: theme.space.lg,
  },
  fieldContent: {
    flexDirection: 'column' as const,
    flexGrow: 1,
    flexShrink: 1,
  },
});
