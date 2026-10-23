import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Row, Text } from 'app/ui';
import { formatMoney } from 'app/i18n/format';
import Section from './Section';

export type FundsSectionProps = {
  creditsCents: number | null | undefined;
  /** The member's own wallet (a member who does not run the money) */
  onWallet?(): void;
  /** Their orders on the office's Money screens (who may read anybody's) */
  onTransactions?(): void;
  /** Adds credit or takes it off (who may) */
  onAddCredit?(): void;
  testID?: string;
};

/** The member's credit with the operator, and where it is topped up or read in full */
export default function FundsSection({
  creditsCents,
  onWallet,
  onTransactions,
  onAddCredit,
  testID = 'profile-funds',
}: FundsSectionProps) {
  const { t } = useTranslation('common');
  const credit = creditsCents ?? 0;

  return (
    <Section title={t('profile.funds.title')} testID={testID}>
      <Row justify="between" align="center" gap="md">
        <Text tone="muted">{t('profile.funds.credit')}</Text>
        <Text variant="title" tone={credit < 0 ? 'blocked' : 'default'} testID={`${testID}-amount`}>
          {formatMoney(credit)}
        </Text>
      </Row>
      {onWallet || onTransactions || onAddCredit ? (
        <Row gap="sm" wrap>
          {onAddCredit ? (
            <Button
              icon="cash-plus"
              label={t('profile.funds.add')}
              testID={`${testID}-add`}
              onPress={onAddCredit}
            />
          ) : null}
          {onWallet ? (
            <Button
              variant="secondary"
              icon="wallet-outline"
              label={t('profile.funds.wallet')}
              testID={`${testID}-wallet`}
              onPress={onWallet}
            />
          ) : null}
          {onTransactions ? (
            <Button
              variant="secondary"
              icon="receipt-text-outline"
              label={t('profile.funds.transactions')}
              testID={`${testID}-transactions`}
              onPress={onTransactions}
            />
          ) : null}
        </Row>
      ) : null}
    </Section>
  );
}
