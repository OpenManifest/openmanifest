import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, useStyles, type Theme } from 'app/ui';
import { WIZARD_MAX_WIDTH } from './constants';

export interface IWizardButtonsProps {
  /** "Next" unless given */
  nextLabel?: string;
  /** "Back" unless given */
  backLabel?: string;
  loading?: boolean;
  /** False for the buttons of pages that are not shown, so only the visible next button is a primary action */
  isCurrent?: boolean;
  onNext?(): Promise<void>;
  onBack?(): Promise<void> | void;
}

/** The actions under a wizard page: the next (or done) button across the column, back under it */
export default function Buttons(props: IWizardButtonsProps) {
  const {
    backLabel,
    loading: controlledLoading,
    isCurrent = true,
    nextLabel,
    onNext,
    onBack,
  } = props;
  const { t } = useTranslation('common');
  const styles = useStyles(stylesFor);
  const [loading, setLoading] = React.useState(false);
  const busy = loading || !!controlledLoading;

  const onNextPress = React.useCallback(async () => {
    setLoading(true);
    try {
      await onNext?.();
    } catch {
      // The step said no (invalid field, failed request): it shows why and the wizard stays on it
    } finally {
      setLoading(false);
    }
  }, [onNext]);

  return (
    <View style={styles.actions}>
      {onNext ? (
        <Button
          testID={isCurrent ? 'wizard-next-primary-action' : undefined}
          label={nextLabel || t('wizard.next')}
          loading={busy}
          onPress={onNextPress}
          fullWidth
        />
      ) : null}
      {onBack ? (
        <Button
          label={backLabel || t('wizard.back')}
          variant="tertiary"
          disabled={busy}
          onPress={onBack}
        />
      ) : null}
    </View>
  );
}

const stylesFor = (theme: Theme) => ({
  actions: {
    alignSelf: 'center' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: theme.space.sm,
    padding: theme.space.lg,
    width: '100%' as const,
    maxWidth: WIZARD_MAX_WIDTH + 2 * theme.space.lg,
  },
});
