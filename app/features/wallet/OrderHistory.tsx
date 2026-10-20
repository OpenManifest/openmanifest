import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Icon, ListRow, StatusBadge, Subheader, Text, useTheme } from 'app/ui';
import { OrderState } from 'app/api/schema.d';
import { formatMoney, formatTime } from 'app/i18n/format';
import { effectCents, groupByDay, paidBy, statusOf, type WalletOrder } from './wallet';

export type OrderHistoryProps = {
  orders: readonly WalletOrder[];
  membershipId: string;
  timeZone?: string | null;
  hasMore?: boolean;
  onMore?(): void;
  onOpen?(order: WalletOrder): void;
  testID?: string;
};

/** What the member paid and was given, by day, newest first: each row opens its receipt */
export default function OrderHistory({
  orders,
  membershipId,
  timeZone,
  hasMore = false,
  onMore,
  onOpen,
  testID = 'wallet-history',
}: OrderHistoryProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();

  if (!orders.length) {
    return (
      <EmptyState
        testID={`${testID}-empty`}
        icon="receipt-text-outline"
        title={t('wallet.empty.title')}
        body={t('wallet.empty.body')}
      />
    );
  }

  return (
    <View testID={testID} style={{ gap: theme.space.sm }}>
      <Text variant="title" role="heading" aria-level={2}>
        {t('wallet.history')}
      </Text>
      {groupByDay(orders, timeZone).map(({ day, title, orders: ofDay }) => (
        <View
          key={day}
          style={{
            backgroundColor: theme.colour.surface,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colour.border,
            paddingVertical: theme.space.sm,
          }}
        >
          <View style={{ paddingHorizontal: theme.space.lg }}>
            <Subheader>{title}</Subheader>
          </View>
          {ofDay.map((order) => {
            const effect = effectCents(order, membershipId);
            const spent = paidBy(order, membershipId);
            const label = String(t(`wallet.state.${order.state}`));
            const name = order.title || t('wallet.order', { number: order.orderNumber });
            const amount =
              order.state === OrderState.Refunded || order.state === OrderState.Cancelled
                ? formatMoney(order.amountCents)
                : `${effect > 0 ? '+' : ''}${formatMoney(effect)}`;
            return (
              <ListRow
                key={order.id}
                testID={`${testID}-${order.id}`}
                title={name}
                aria-label={`${name}, ${label}, ${amount}`}
                supporting={`${formatTime(order.createdAt, timeZone)} · ${label}`}
                leading={
                  <Icon
                    name={spent ? 'cash-minus' : 'cash-plus'}
                    size={24}
                    tone={spent ? 'muted' : 'brand'}
                  />
                }
                trailing={
                  <View style={{ alignItems: 'flex-end', gap: theme.space.xs }}>
                    <Text
                      tone={effect === 0 ? 'muted' : 'default'}
                      testID={`${testID}-${order.id}-amount`}
                    >
                      {amount}
                    </Text>
                    <StatusBadge status={statusOf(order.state)} label={label} />
                  </View>
                }
                onPress={onOpen ? () => onOpen(order) : undefined}
              />
            );
          })}
        </View>
      ))}
      {hasMore ? (
        <Button
          variant="tertiary"
          testID={`${testID}-more`}
          label={t('wallet.more')}
          onPress={onMore}
        />
      ) : null}
    </View>
  );
}
