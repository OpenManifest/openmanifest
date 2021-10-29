import * as React from 'react';
import { useRoute } from '@react-navigation/core';
import { Button, Card, Divider, List, useTheme } from 'react-native-paper';
import { Text, View } from 'react-native';
import color from 'color';
import { successColor } from '../../../constants/Colors';
import LottieView from '../../../components/LottieView';
import { Dropzone, DropzoneUser, Order, Receipt, Wallet } from '../../../api/schema.d';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import UserAvatar from '../../../components/UserAvatar';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import lottieTicketAnimation from '../../../../assets/images/ticket.json';
import TransactionCard from './TransactionCard';

interface IReceiptCardProps {
  receipt: Receipt;
  index: number;
  order: Order;
}

function ReceiptCard(props: IReceiptCardProps) {
  const { receipt, index } = props;
  const { currentUser } = useCurrentDropzone();

  const isUser = React.useCallback(
    (entity: Wallet | Dropzone | DropzoneUser) => {
      return (
        '__typename' in entity &&
        entity.__typename === 'DropzoneUser' &&
        entity.id === currentUser?.id
      );
    },
    [currentUser]
  );

  return (
    <>
      <List.Subheader>{`Receipt #${index + 1}`}</List.Subheader>
      {receipt?.transactions
        .filter((transaction) => isUser(transaction.receiver))
        .map((transaction) => (
          <TransactionCard {...{ transaction }} />
        ))}
    </>
  );
}
export default function OrderScreen() {
  const route = useRoute<{ key: string; name: string; params: { order: Order } }>();
  const theme = useTheme();
  const { order } = route.params;

  console.log('Order', route.params);

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
    <ScrollableScreen>
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
                }}
              >{`Order #${order.id}`}</Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  opacity: 0.6,
                  alignSelf: 'flex-start',
                  fontSize: 14,
                  marginLeft: 16,
                  width: '100%',
                  marginBottom: 48,
                }}
              >
                {order.title}
              </Text>
              <Button mode="outlined" color={successColor} style={{ borderRadius: 16, margin: 8 }}>
                {order.state}
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
              title={(order?.buyer as DropzoneUser)?.user?.name || (order?.buyer as Dropzone)?.name}
              left={(props) => (
                <UserAvatar
                  name={
                    (order?.buyer as DropzoneUser)?.user?.name ||
                    (order?.buyer as Dropzone)?.name ||
                    ''
                  }
                  image={
                    (order?.buyer as DropzoneUser)?.user?.image ||
                    (order?.buyer as Dropzone)?.banner ||
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
                    (order?.seller as DropzoneUser)?.user?.name ||
                    (order?.seller as Dropzone)?.name ||
                    ''
                  }
                  image={
                    (order?.buyer as DropzoneUser)?.user?.image ||
                    (order?.buyer as Dropzone)?.banner ||
                    ''
                  }
                  style={{ alignSelf: 'center', marginLeft: 8 }}
                  size={36}
                />
              )}
              titleStyle={{ textAlign: 'right', fontSize: 14 }}
              descriptionStyle={{ textAlign: 'right', fontSize: 10 }}
              title={
                (order?.seller as DropzoneUser)?.user?.name || (order?.seller as Dropzone)?.name
              }
            />
          )}
        />
      </Card>
      {order?.receipts?.map((receipt, index) => {
        return <ReceiptCard {...{ receipt, order, index }} />;
      })}
    </ScrollableScreen>
  );
}
