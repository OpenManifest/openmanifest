import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useAppSelector } from 'app/state';

export interface IWizardButtonsProps {
  nextLabel: string;
  backLabel: string;
  onNext?(): Promise<void>;
  onBack?(): Promise<void> | void;
}

export default function Buttons(props: IWizardButtonsProps) {
  const { backLabel = 'Back', nextLabel = 'Next', onNext, onBack } = props;
  const [loading, setLoading] = React.useState(false);
  const { palette } = useAppSelector((root) => root.global);

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
          disabled={loading}
          loading={loading}
          onPress={onNextPress}
          style={[styles.next, { backgroundColor: palette.placeholder }]}
          mode="contained"
        >
          {nextLabel || 'Next'}
        </Button>
      )}
      {onBack && (
        <Button style={styles.back} disabled={loading} mode="text" onPress={onBack}>
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
    paddingBottom: 48,
    width: '100%',
    maxWidth: 500,
    height: 80,
  },
  next: {
    width: '100%',
    borderRadius: 20,
    minWidth: 300,
    minHeight: 36,
  },
  back: {
    minHeight: 36,
  },
});
