import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Row, Skeleton, StatusBadge, Subheader, Text, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { useWalletQuery } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers';
import { formatDateTime, formatMoney } from 'app/i18n/format';
import { ordersOf, paidBy, statusOf } from './wallet';

export type WalletReceiptRoute = { WalletReceiptScreen: { orderId: string } };

/** The receipt of one order: what it was, what it cost, who the money went to, and what moved on the member's account */
export default function ReceiptScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const route = useRoute<RouteProp<WalletReceiptRoute, 'WalletReceiptScreen'>>();
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const { data, loading } = useWalletQuery({
    variables: { membershipId: currentUser?.id as string, first: 100 },
    skip: !currentUser?.id,
    fetchPolicy: 'cache-and-network',
  });
  const order = ordersOf(data).find(({ id }) => id === route.params?.orderId);
  const memberId = currentUser?.id ?? '';

  if (!order) {
    return loading || !currentUser ? (
      <ScreenContainer edges={['bottom']}>
        <View style={{ padding: theme.space.lg }}>
          <Skeleton height={200} />
        </View>
      </ScreenContainer>
    ) : (
      <EmptyState
        testID="wallet-receipt-missing"
        icon="receipt-text-outline"
        title={t('wallet.receipt.missing')}
      />
    );
  }

  const seller =
    order.seller?.__typename === 'Membership' ? order.seller.user.name : order.seller?.name;
  const label = String(t(`wallet.state.${order.state}`));
  const name = order.title || t('wallet.order', { number: order.orderNumber });
  const card = {
    gap: theme.space.md,
    padding: theme.space.lg,
    backgroundColor: theme.colour.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colour.border,
  } as const;

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView
        testID="wallet-receipt"
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: theme.space.xxxl,
        }}
      >
        <View style={card}>
          <Row justify="between" align="start" gap="md">
            <View style={{ flex: 1, gap: theme.space.xs }}>
              <Text variant="title" role="heading" aria-level={2}>
                {name}
              </Text>
              <Text tone="muted">{t('wallet.order', { number: order.orderNumber })}</Text>
            </View>
            <StatusBadge
              status={statusOf(order.state)}
              label={label}
              testID="wallet-receipt-state"
            />
          </Row>
          <Row justify="between" gap="md">
            <Text tone="muted">
              {paidBy(order, memberId) ? t('wallet.receipt.paid') : t('wallet.receipt.given')}
            </Text>
            <Text testID="wallet-receipt-amount">{formatMoney(order.amountCents)}</Text>
          </Row>
          {seller ? (
            <Row justify="between" gap="md">
              <Text tone="muted">{t('wallet.receipt.seller')}</Text>
              <Text>{seller}</Text>
            </Row>
          ) : null}
          <Row justify="between" gap="md">
            <Text tone="muted">{t('wallet.receipt.date')}</Text>
            <Text>{formatDateTime(order.createdAt, operator?.timeZone)}</Text>
          </Row>
        </View>

        {(order.receipts ?? []).map((receipt, index) => {
          // Both sides of a sale are on the receipt: the member sees the ones that moved their own account
          const mine = receipt.transactions.filter(
            ({ receiver }) => receiver?.__typename === 'Membership' && receiver.id === memberId
          );
          return (
            <View key={receipt.id} style={card} testID={`wallet-receipt-${receipt.id}`}>
              <Subheader>{t('wallet.receipt.number', { number: index + 1 })}</Subheader>
              {mine.map((transaction) => (
                <Row key={transaction.id} justify="between" align="start" gap="md">
                  <View style={{ flex: 1 }}>
                    <Text>{String(t(`wallet.transaction.${transaction.transactionType}`))}</Text>
                    <Text variant="caption" tone="muted">
                      {[
                        transaction.message,
                        formatDateTime(transaction.createdAt, operator?.timeZone),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Text>{formatMoney(transaction.amountCents)}</Text>
                </Row>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}
