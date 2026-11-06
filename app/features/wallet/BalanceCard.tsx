import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Row, Text, useTheme } from 'app/ui';
import { formatMoney } from 'app/i18n/format';

export type BalanceCardProps = {
  /** What the member holds with the operator, in cents */
  creditsCents: number | null | undefined;
  /** What is held for the jumps they booked, in cents */
  heldCents: number;
  testID?: string;
};

/** The balance as the largest numeral, what is held for booked jumps, and how to top up (at the manifest desk) */
export default function BalanceCard({
  creditsCents,
  heldCents,
  testID = 'wallet-balance',
}: BalanceCardProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const credit = creditsCents ?? 0;

  return (
    <View
      testID={testID}
      style={{
        gap: theme.space.md,
        padding: theme.space.lg,
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: theme.colour.brand,
      }}
    >
      <Text variant="label" tone="muted" role="heading" aria-level={2}>
        {t('wallet.balance')}
      </Text>
      <Text
        variant="countdown"
        tone={credit < 0 ? 'blocked' : 'default'}
        testID={`${testID}-amount`}
      >
        {formatMoney(credit)}
      </Text>
      <Row justify="between" align="center" gap="md" testID={`${testID}-held`}>
        <Text tone="muted">{t('wallet.held')}</Text>
        <Text>{formatMoney(heldCents)}</Text>
      </Row>
      <Text variant="caption" tone="muted">
        {heldCents ? t('wallet.heldNote') : t('wallet.nothingHeld')}
      </Text>
      <Text variant="caption" tone="muted" testID={`${testID}-top-up`}>
        {t('wallet.topUp')}
      </Text>
    </View>
  );
}
