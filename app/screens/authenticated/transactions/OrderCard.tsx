/* eslint-disable no-underscore-dangle */
import * as React from 'react';
import { Caption, Card, Chip, List, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { successColor } from '../../../constants/Colors';
import { DropzoneUser, Order } from '../../../api/schema';

interface IOrder {
  order: Order;
  dropzoneUser: DropzoneUser;
  onPress?(): void;
}

function OrderItems(props: { item: Order['item'] }) {
  const { item } = props;
  // eslint-disable-next-line no-underscore-dangle
  switch (item?.__typename) {
    case 'Extra':
      return <Chip mode="outlined">{item.title}</Chip>;
    case 'Slot':
      return (
        <>
          <Chip mode="outlined">{item.ticketType.name}</Chip>
          {item.extras?.map((extra) => (
            <Chip mode="outlined">{extra.name}</Chip>
          ))}
        </>
      );
    case 'TicketType':
      return <Chip>{item.title}</Chip>;
    default:
      return null;
  }
}
export default function OrderCard(props: IOrder) {
  const { order, dropzoneUser, onPress } = props;
  const theme = useTheme();
  const icon =
    (order.buyer.__typename === 'DropzoneUser' && (order.buyer as DropzoneUser)).id ===
    dropzoneUser.id
      ? 'cash-minus'
      : 'cash-plus';

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.order}>
        <Card.Content style={styles.orderContent}>
          <Caption
            style={{
              position: 'absolute',
              top: 4,
              right: 8,
            }}
          >
            {format(order?.createdAt * 1000, 'Mo MMM, h:mm aaa')}
          </Caption>
          <List.Item
            title={`#${order.id} ${order.title}`}
            style={{ width: '100%' }}
            titleStyle={styles.orderTitle}
            descriptionStyle={styles.orderDescription}
            left={() => (
              <View style={{ width: 165, alignItems: 'center', flexDirection: 'row' }}>
                <MaterialCommunityIcons
                  color={
                    // eslint-disable-next-line no-underscore-dangle
                    order.buyer.__typename === 'DropzoneUser' &&
                    (order.buyer as DropzoneUser)?.id === dropzoneUser.id
                      ? '#FF1414'
                      : successColor
                  }
                  name={icon}
                  size={36}
                  style={{ marginHorizontal: 16 }}
                />
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: '100',
                    textAlign: 'center',
                    color: theme.colors.onSurface,
                  }}
                >
                  ${order.amount}
                </Text>
              </View>
            )}
          />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatarIcon: {},
  orderTitle: {
    paddingLeft: 0,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 0,
  },
  orderDescription: {
    paddingLeft: 0,
  },
  orderContent: { paddingLeft: 0, paddingRight: 4, paddingTop: 8, paddingBottom: 8 },
  order: {
    marginHorizontal: 0,
    marginVertical: StyleSheet.hairlineWidth,
    borderRadius: 2,
    width: '100%',
  },
});
