import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FormColumn, { FORM_COLUMN_MAX_WIDTH } from 'app/components/layout/FormColumn';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { Button, ProgressMeter, Stack, Text, useTheme } from 'app/ui';

export type WizardShellProps = {
  /** The step shown, from 0 */
  index: number;
  count: number;
  title: string;
  /** A sentence under the title */
  intro?: string;
  nextLabel: string;
  busy?: boolean;
  onNext(): void;
  /** No back button when omitted */
  onBack?(): void;
  children: React.ReactNode;
};

/**
 * The frame of the operator wizard (P7.23): where the owner is, the step's heading and content in the form column, and
 * the actions under it, which stay in reach while the content scrolls.
 */
export default function WizardShell(props: WizardShellProps) {
  const { index, count, title, intro, nextLabel, busy = false, onNext, onBack, children } = props;
  const { t } = useTranslation('common');
  const theme = useTheme();

  return (
    <ScreenContainer testID="wizard">
      <FormColumn contentContainerStyle={{ paddingTop: theme.space.lg, gap: theme.space.lg }}>
        <ProgressMeter
          value={index + 1}
          max={count}
          label={t('wizard.progress', { step: index + 1, count })}
          valueText={t('wizard.progress', { step: index + 1, count })}
          showValue={false}
        />
        <Stack gap="xs">
          <Text variant="title" role="heading" aria-level={1}>
            {title}
          </Text>
          {intro ? <Text tone="muted">{intro}</Text> : null}
        </Stack>
        {children}
      </FormColumn>
      <View
        style={{
          padding: theme.space.md,
          backgroundColor: theme.colour.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colour.border,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: FORM_COLUMN_MAX_WIDTH,
            alignSelf: 'center',
            gap: theme.space.sm,
          }}
        >
          <Button
            testID="wizard-next-primary-action"
            label={nextLabel}
            loading={busy}
            onPress={onNext}
            fullWidth
          />
          {onBack ? (
            <Button
              testID="wizard-back"
              label={t('wizard.back')}
              variant="tertiary"
              disabled={busy}
              onPress={onBack}
            />
          ) : null}
        </View>
      </View>
    </ScreenContainer>
  );
}
