import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Row, Text, useTheme } from 'app/ui';
import { formatMoney } from 'app/i18n/format';

export type CreditCardProps = {
  /** What the member holds with the operator, in cents */
  creditsCents: number | null | undefined;
  testID?: string;
};

/** The member's credit with the dropzone: what they can still book before they need to top up */
export default function CreditCard({ creditsCents, testID = 'today-credit' }: CreditCardProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const credit = creditsCents ?? 0;

  return (
    <View
      testID={testID}
      style={{
        padding: theme.space.lg,
        backgroundColor: theme.colour.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colour.border,
      }}
    >
      <Row justify="between" align="center" gap="md">
        <Text variant="title" role="heading" aria-level={2}>
          {t('today.credit.title')}
        </Text>
        <Text variant="title" tone={credit < 0 ? 'blocked' : 'default'} testID={`${testID}-amount`}>
          {formatMoney(credit)}
        </Text>
      </Row>
    </View>
  );
}
