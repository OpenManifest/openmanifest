import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { uniqBy } from 'lodash';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import FormColumn, { FORM_COLUMN_WIDE_MAX_WIDTH } from 'app/components/layout/FormColumn';
import { useOperatorTransactionsQuery } from 'app/api/reflection';
import { OrderState } from 'app/api/schema.d';
import { formatMoney, formatTime } from 'app/i18n/format';
import useOpenUser from 'app/navigation/useOpenUser';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  Button,
  EmptyState,
  ListRow,
  Skeleton,
  StatusBadge,
  Subheader,
  Text,
  useTheme,
} from 'app/ui';
import StatGroup from 'app/features/reports/StatGroup';
import { groupByDay, statusOf } from 'app/features/wallet/wallet';
import {
  memberOf,
  operatorEffectCents,
  ordersOf,
  partyName,
  sumsOf,
  type MoneyOrder,
} from './money';

const PAGE = 50;

/**
 * Money (More → Money, staff who read transactions): every order of the operator, newest first by day, with who paid
 * whom and the state; what came in and went out over the orders shown. A row opens the member's receipt.
 */
export default function MoneyScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const openUser = useOpenUser();
  const {
    operator: { operator },
  } = useOperatorContext();
  const operatorId = operator?.id ? String(operator.id) : '';
  const { data, loading, fetchMore } = useOperatorTransactionsQuery({
    variables: { operatorId, first: PAGE },
    skip: !operatorId,
    fetchPolicy: 'cache-and-network',
  });
  const orders = ordersOf(data);
  const pageInfo = data?.operator?.orders?.pageInfo;
  const sums = sumsOf(orders, operatorId);

  const onMore = React.useCallback(() => {
    if (!pageInfo?.endCursor) return;
    fetchMore({
      variables: { after: pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!previous.operator?.orders || !fetchMoreResult.operator?.orders) return previous;
        return {
          ...previous,
          operator: {
            ...previous.operator,
            orders: {
              ...previous.operator.orders,
              pageInfo: fetchMoreResult.operator.orders.pageInfo,
              edges: uniqBy(
                [
                  ...(previous.operator.orders.edges ?? []),
                  ...(fetchMoreResult.operator.orders.edges ?? []),
                ],
                (edge) => edge?.node?.id
              ),
            },
          },
        };
      },
    });
  }, [fetchMore, pageInfo]);

  const open = (order: MoneyOrder) => {
    const member = memberOf(order);
    if (member) openUser('OrderReceiptScreen', { orderId: order.id, userId: member.id });
  };

  return (
    <ScreenContainer edges={['bottom']} testID="money">
      <FormColumn
        maxWidth={FORM_COLUMN_WIDE_MAX_WIDTH}
        contentContainerStyle={{ paddingTop: theme.space.lg, gap: theme.space.lg }}
      >
        {loading && !orders.length ? <Skeleton height={240} /> : null}
        {!loading && !orders.length ? (
          <EmptyState
            testID="money-empty"
            icon="cash-multiple"
            title={t('money.empty.title')}
            body={t('money.empty.body')}
          />
        ) : null}
        {orders.length ? (
          <StatGroup
            title={t('money.shown', { count: orders.length })}
            testID="money-sums"
            stats={[
              { key: 'in', label: t('money.in'), value: formatMoney(sums.inCents), tone: 'ok' },
              { key: 'out', label: t('money.out'), value: formatMoney(sums.outCents) },
            ]}
          />
        ) : null}
        {groupByDay(orders, operator?.timeZone).map(({ day, title, orders: ofDay }) => (
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
              const label = String(t(`wallet.state.${order.state}`));
              const name = order.title || t('wallet.order', { number: order.orderNumber });
              const effect = operatorEffectCents(order, operatorId);
              const amount =
                order.state === OrderState.Refunded || order.state === OrderState.Cancelled
                  ? formatMoney(order.amountCents)
                  : `${effect > 0 ? '+' : ''}${formatMoney(effect)}`;
              const parties = t('money.parties', {
                from: partyName(order.buyer),
                to: partyName(order.seller),
              });
              const member = memberOf(order);
              return (
                <ListRow
                  key={order.id}
                  testID={`money-order-${order.id}`}
                  title={name}
                  supporting={`${formatTime(order.createdAt, operator?.timeZone)} · ${parties}`}
                  aria-label={`${name}, ${parties}, ${label}, ${amount}`}
                  trailing={
                    <View style={{ alignItems: 'flex-end', gap: theme.space.xs }}>
                      <Text
                        tone={effect === 0 ? 'muted' : 'default'}
                        testID={`money-order-${order.id}-amount`}
                      >
                        {amount}
                      </Text>
                      <StatusBadge status={statusOf(order.state)} label={label} />
                    </View>
                  }
                  onPress={member ? () => open(order) : undefined}
                />
              );
            })}
          </View>
        ))}
        {pageInfo?.hasNextPage ? (
          <Button variant="tertiary" testID="money-more" label={t('money.more')} onPress={onMore} />
        ) : null}
      </FormColumn>
    </ScreenContainer>
  );
}
