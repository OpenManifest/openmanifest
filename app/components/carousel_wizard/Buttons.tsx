import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useAppTheme } from 'app/theme';

export interface IWizardButtonsProps {
  nextLabel: string;
  backLabel: string;
  loading?: boolean;
  /** False for the buttons of pages that are not shown, so only the visible next button is a primary action */
  isCurrent?: boolean;
  onNext?(): Promise<void>;
  onBack?(): Promise<void> | void;
}

export default function Buttons(props: IWizardButtonsProps) {
  const {
    backLabel = 'Back',
    loading: controlledLoading,
    isCurrent = true,
    nextLabel = 'Next',
    onNext,
    onBack,
  } = props;
  const [loading, setLoading] = React.useState(false);
  const { palette } = useAppTheme();
  const onNextPress = React.useCallback(async () => {
    try {
      await onNext?.();
    } catch {
      return undefined;
    } finally {
      setLoading(false);
    }

    return undefined;
  }, [onNext]);

  return (
    <View style={styles.actions}>
      {onNextPress && (
        <Button
          testID={isCurrent ? 'wizard-next-primary-action' : undefined}
          disabled={loading || controlledLoading}
          loading={loading || controlledLoading}
          onPress={onNextPress}
          style={[styles.next, { backgroundColor: palette.placeholder }]}
          mode="contained"
        >
          {nextLabel || 'Next'}
        </Button>
      )}
      {onBack && (
        <Button
          style={styles.back}
          disabled={loading || controlledLoading}
          mode="text"
          onPress={onBack}
        >
          {backLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    width: '100%',
    maxWidth: 400 + 32,
    minHeight: 80,
  },
  next: {
    width: '100%',
    borderRadius: 20,
    minHeight: 36,
  },
  back: {
    minHeight: 36,
  },
});
