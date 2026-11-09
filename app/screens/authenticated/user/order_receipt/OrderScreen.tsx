import * as React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import color from 'color';
import LottieView from 'app/components/LottieView';
import { Operator, Membership } from 'app/api/schema.d';
import FormColumn from 'app/components/layout/FormColumn';
import UserAvatar from 'app/components/UserAvatar';
import lottieTicketAnimation from 'app/../assets/images/ticket.json';
import { OperatorEssentialsFragment } from 'app/api/operations';
import { useUserProfile } from 'app/api/crud';
import useWalletRedirect from 'app/features/wallet/useWalletRedirect';
import { Card, Divider, ListRow, Row, StatusBadge, Text, useTheme } from 'app/ui';
import ReceiptCard from './ReceiptCard';

export type OrderReceiptRoute = {
  OrderReceiptScreen: {
    orderId: string;
    userId: string;
  };
};
export default function OrderScreen() {
  const route = useRoute<RouteProp<OrderReceiptRoute, 'OrderReceiptScreen'>>();
  const theme = useTheme();
  const { orderId, userId } = route.params;
  const toWallet = useWalletRedirect(userId, orderId);
  const { membership } = useUserProfile({ id: userId });
  const order = React.useMemo(
    () => membership?.orders?.edges?.map((edge) => edge?.node).find((node) => node?.id === orderId),
    [membership?.orders?.edges, orderId]
  );

  const animation = React.useMemo(
    () =>
      JSON.parse(
        JSON.stringify(lottieTicketAnimation).replace(
          /260,254,0/g,
          [
            color(theme.colour.brand).red(),
            color(theme.colour.brand).green(),
            color(theme.colour.brand).blue(),
          ].join(',')
        )
      ),
    [theme.colour.brand]
  );
  if (toWallet) return null;

  const buyerName =
    (order?.buyer as Membership)?.user?.name || (order?.buyer as Operator)?.name || '';
  const sellerName =
    (order?.seller as Membership)?.user?.name ||
    (order?.seller as OperatorEssentialsFragment)?.name ||
    '';

  return (
    <FormColumn>
      <View style={{ marginTop: theme.space.xxl, width: '100%', maxWidth: 600 }}>
        <Card variant="raised" padding="none">
          <View style={{ padding: theme.space.lg }}>
            <Row gap="md" align="center">
              <LottieView
                loop={false}
                autoPlay
                speed={0.5}
                style={{
                  height: 150,
                  width: 150,
                }}
                source={animation as unknown as string}
              />
              <View style={{ flexGrow: 1, flexShrink: 1, gap: theme.space.sm }}>
                <Text variant="title" role="heading">{`Order #${order?.id || ''}`}</Text>
                <Text tone="muted">{order?.title}</Text>
                {order?.state ? <StatusBadge status="ok" label={order.state} /> : null}
              </View>
            </Row>
          </View>
          <Divider />
          <Row gap="sm">
            <View style={{ flex: 1 }}>
              <ListRow
                title={buyerName}
                supporting="Buyer"
                leading={
                  <UserAvatar
                    name={buyerName}
                    image={
                      (order?.buyer as Membership)?.user?.image ||
                      (order?.buyer as Operator)?.banner ||
                      ''
                    }
                    size={36}
                  />
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <ListRow
                title={sellerName}
                supporting="Seller"
                trailing={
                  <UserAvatar
                    name={sellerName}
                    image={
                      (order?.seller as Membership)?.user?.image ||
                      (order?.seller as OperatorEssentialsFragment)?.banner ||
                      ''
                    }
                    size={36}
                  />
                }
              />
            </View>
          </Row>
        </Card>
      </View>
      {order?.receipts?.map((receipt, index) => {
        return <ReceiptCard key={receipt.id} {...{ receipt, order, index }} />;
      })}
    </FormColumn>
  );
}
