import * as React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Button, Card, Divider, List, useTheme } from 'react-native-paper';
import { Text, View } from 'react-native';
import color from 'color';
import { successColor } from 'app/constants/Colors';
import LottieView from 'app/components/LottieView';
import { Operator, Membership } from 'app/api/schema.d';
import FormColumn from 'app/components/layout/FormColumn';
import UserAvatar from 'app/components/UserAvatar';
import lottieTicketAnimation from 'app/../assets/images/ticket.json';
import { OperatorEssentialsFragment } from 'app/api/operations';
import { useUserProfile } from 'app/api/crud';
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
            color(theme.colors.primary).red(),
            color(theme.colors.primary).green(),
            color(theme.colors.primary).blue(),
          ].join(',')
        )
      ),
    [theme.colors.primary]
  );
  return (
    <FormColumn>
      <Card style={{ marginTop: 32, width: '100%', maxWidth: 600 }}>
        <Card.Content style={{ paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
            <View style={{ flexGrow: 1 }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  alignSelf: 'flex-start',
                  fontSize: 26,
                  marginLeft: 16,
                  width: '100%',
                  color: theme.colors.onSurface,
                }}
              >{`Order #${order?.id || ''}`}</Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  opacity: 0.6,
                  alignSelf: 'flex-start',
                  fontSize: 14,
                  marginLeft: 16,
                  width: '100%',
                  marginBottom: 48,
                  color: theme.colors.onSurface,
                }}
              >
                {order?.title}
              </Text>
              <Button mode="outlined" color={successColor} style={{ borderRadius: 16, margin: 8 }}>
                {order?.state}
              </Button>
            </View>
          </View>
        </Card.Content>
        <Divider />
        <Card.Title
          style={{ flexDirection: 'row' }}
          titleStyle={{ width: '50%' }}
          rightStyle={{ width: '50%' }}
          title={
            <List.Item
              description="Buyer"
              title={(order?.buyer as Membership)?.user?.name || (order?.buyer as Operator)?.name}
              left={(props) => (
                <UserAvatar
                  name={
                    (order?.buyer as Membership)?.user?.name ||
                    (order?.buyer as Operator)?.name ||
                    ''
                  }
                  image={
                    (order?.buyer as Membership)?.user?.image ||
                    (order?.buyer as Operator)?.banner ||
                    ''
                  }
                  style={{ alignSelf: 'center' }}
                  size={36}
                />
              )}
              titleStyle={{ width: 100, fontSize: 14 }}
              descriptionStyle={{ width: 100, fontSize: 10 }}
            />
          }
          right={() => (
            <List.Item
              description="Seller"
              right={(props) => (
                <UserAvatar
                  name={
                    (order?.seller as Membership)?.user?.name ||
                    (order?.seller as OperatorEssentialsFragment)?.name ||
                    ''
                  }
                  image={
                    (order?.buyer as Membership)?.user?.image ||
                    (order?.buyer as Operator)?.banner ||
                    ''
                  }
                  style={{ alignSelf: 'center', marginLeft: 8 }}
                  size={36}
                />
              )}
              titleStyle={{ textAlign: 'right', fontSize: 14 }}
              descriptionStyle={{ textAlign: 'right', fontSize: 10 }}
              title={
                (order?.seller as Membership)?.user?.name ||
                (order?.seller as OperatorEssentialsFragment)?.name
              }
            />
          )}
        />
      </Card>
      {order?.receipts?.map((receipt, index) => {
        return <ReceiptCard {...{ receipt, order, index }} />;
      })}
    </FormColumn>
  );
}
