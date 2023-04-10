import * as React from 'react';
import { Caption, Card, List, useTheme } from 'react-native-paper';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  DropzoneEssentialsFragment,
  DropzoneUserEssentialsFragment,
  OrderEssentialsFragment
} from 'app/api/operations';
import { DropzoneUser } from 'app/api/schema.d';
import { successColor } from 'app/constants/Colors';
import UserAvatar from 'app/components/UserAvatar';
import { DateTime } from 'luxon';

interface IOrder {
  order: OrderEssentialsFragment;
  dropzoneUser?: DropzoneUserEssentialsFragment | null;
  showAvatar?: boolean;
  onPress?(): void;
}

export default function OrderCard(props: IOrder) {
  const { order, dropzoneUser, showAvatar, onPress } = props;
  const theme = useTheme();
  const isSelfBuyer =
    order.buyer?.__typename === 'DropzoneUser' && (order.buyer as DropzoneUser)?.id === dropzoneUser?.id;
  const icon =
    // @ts-ignore
    isSelfBuyer === dropzoneUser?.id ? 'cash-minus' : 'cash-plus';

  const right = React.useCallback(
    () => (
      <Text
        style={{
          fontSize: 16,
          fontFamily: 'Roboto_400Regular',
          fontWeight: '400',
          textAlign: 'center',
          alignSelf: 'center',
          color: theme.colors.onSurface
        }}
      >
        {`${isSelfBuyer ? '-$' : '$'}${order.amount.toFixed(2)}`}
      </Text>
    ),
    [isSelfBuyer, order.amount, theme.colors.onSurface]
  );

  const left = React.useCallback(
    () => (
      <View style={{ alignItems: 'center', flexDirection: 'row' }}>
        {showAvatar ? (
          <UserAvatar
            style={{ alignSelf: 'center', marginHorizontal: 12 }}
            size={60}
            name={
              (order?.buyer as DropzoneUserEssentialsFragment)?.user?.name ||
              (order?.buyer as DropzoneEssentialsFragment).name ||
              ''
            }
            image={
              (order?.buyer as DropzoneUserEssentialsFragment).user?.image ||
              (order?.buyer as DropzoneEssentialsFragment).banner ||
              undefined
            }
          />
        ) : (
          <MaterialCommunityIcons
            color={
              order.buyer &&
              '__typename' in order.buyer &&
              // @ts-ignore
              order.buyer.__typename === 'DropzoneUser' &&
              (order.buyer as DropzoneUserEssentialsFragment)?.id === dropzoneUser?.id
                ? '#FF1414'
                : successColor
            }
            name={icon}
            size={36}
            style={{ marginHorizontal: 16 }}
          />
        )}
      </View>
    ),
    [dropzoneUser?.id, icon, order.buyer, showAvatar]
  );
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.order}>
        <Caption
          style={{
            textAlign: 'right',
            paddingRight: 4,
            paddingTop: 2,
            marginBottom: 0
          }}
        >
          {DateTime.fromISO(order?.createdAt).toLocaleString(DateTime.DATETIME_SHORT)}
        </Caption>
        <Card.Content style={styles.orderContent}>
          <List.Item
            title={(order?.buyer as DropzoneUser)?.user?.name || (order?.buyer as DropzoneEssentialsFragment)?.name}
            style={{ width: '100%' }}
            titleStyle={styles.orderTitle}
            description={order.title || null}
            descriptionStyle={styles.orderDescription}
            {...{ right, left }}
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6
  },
  orderDescription: {
    paddingLeft: 0
  },
  orderContent: { paddingLeft: 0, paddingRight: 4, paddingTop: 8, paddingBottom: 8 },
  order: {
    marginHorizontal: 0,
    marginVertical: StyleSheet.hairlineWidth,
    width: '100%'
  }
});