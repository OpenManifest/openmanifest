import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Skeleton, useTheme } from 'app/ui';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useBreakpoint from 'app/components/layout/useBreakpoint';
import { useWalletQuery } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers';
import BalanceCard from './BalanceCard';
import OrderHistory from './OrderHistory';
import { heldCents, ordersOf } from './wallet';

const PAGE = 30;

/**
 * The member's money with the operator: the balance, what is held for the jumps they booked, how to top up, and what
 * they paid and were given, newest first, each with its receipt.
 */
export default function WalletScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const wide = useBreakpoint() !== 'compact';
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const [size, setSize] = React.useState(PAGE);

  const { data, loading, refetch } = useWalletQuery({
    variables: { membershipId: currentUser?.id as string, first: size },
    skip: !currentUser?.id,
    fetchPolicy: 'cache-and-network',
  });
  React.useEffect(() => {
    if (isFocused && currentUser?.id) refetch();
  }, [currentUser?.id, isFocused, refetch]);

  const memberId = currentUser?.id ?? '';
  const orders = React.useMemo(() => ordersOf(data), [data]);
  const held = React.useMemo(() => heldCents(orders, memberId), [orders, memberId]);
  const waiting = !currentUser || (loading && !data);

  const open = (order: { id: string }) =>
    navigation.navigate('Authenticated', {
      screen: 'Wallet',
      params: { screen: 'WalletReceiptScreen', params: { orderId: order.id } },
    });

  const balance = (
    <BalanceCard
      creditsCents={data?.membership?.creditsCents ?? currentUser?.creditsCents}
      heldCents={held}
    />
  );
  const history = (
    <OrderHistory
      orders={orders}
      membershipId={memberId}
      timeZone={operator?.timeZone}
      hasMore={!!data?.membership?.orders?.pageInfo.hasNextPage}
      onMore={() => setSize((current) => current + PAGE)}
      onOpen={open}
    />
  );

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollView
        testID="wallet"
        contentContainerStyle={{
          padding: theme.space.lg,
          gap: theme.space.lg,
          paddingBottom: theme.space.xxxl,
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        {waiting ? (
          <View style={{ gap: theme.space.md }} testID="wallet-loading">
            <Skeleton height={200} />
            <Skeleton height={160} />
          </View>
        ) : wide ? (
          <View style={{ flexDirection: 'row', gap: theme.space.lg, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>{balance}</View>
            <View style={{ flex: 1 }}>{history}</View>
          </View>
        ) : (
          <View style={{ gap: theme.space.lg }}>
            {balance}
            {history}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
