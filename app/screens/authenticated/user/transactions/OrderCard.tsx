/* eslint-disable no-underscore-dangle */
import * as React from 'react';
import { Card, List, useTheme } from 'react-native-paper';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  DropzoneEssentialsFragment,
  DropzoneUserEssentialsFragment,
  OrderEssentialsFragment,
} from 'app/api/operations';
import { Dropzone, DropzoneUser } from 'app/api/schema.d';
import { successColor } from 'app/constants/Colors';
import UserAvatar from 'app/components/UserAvatar';

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
    order.buyer?.__typename === 'DropzoneUser' &&
    (order.buyer as DropzoneUser)?.id === dropzoneUser?.id;
  const icon =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    isSelfBuyer === dropzoneUser?.id ? 'cash-minus' : 'cash-plus';

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.order}>
        <Card.Content style={styles.orderContent}>
          <List.Item
            title={(order?.seller as DropzoneUser)?.user?.name || (order?.seller as Dropzone)?.name}
            style={{ width: '100%' }}
            titleStyle={styles.orderTitle}
            description={order.title || null}
            descriptionStyle={styles.orderDescription}
            right={() => (
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Roboto_400Regular',
                  fontWeight: '400',
                  textAlign: 'center',
                  alignSelf: 'center',
                  color: theme.colors.onSurface,
                }}
              >
                {`${isSelfBuyer ? '-$' : '$'}${order.amount.toFixed(2)}`}
              </Text>
            )}
            left={() => (
              <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                {showAvatar ? (
                  <UserAvatar
                    style={{ alignSelf: 'center', marginHorizontal: 12 }}
                    size={60}
                    name={
                      (order?.seller as DropzoneUserEssentialsFragment)?.user?.name ||
                      (order?.seller as DropzoneEssentialsFragment).name ||
                      ''
                    }
                    image={
                      (order?.seller as DropzoneUserEssentialsFragment).user?.image ||
                      (order?.seller as DropzoneEssentialsFragment).banner ||
                      undefined
                    }
                  />
                ) : (
                  <MaterialCommunityIcons
                    color={
                      // eslint-disable-next-line no-underscore-dangle
                      '__typename' in order.buyer &&
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  orderDescription: {
    paddingLeft: 0,
  },
  orderContent: { paddingLeft: 0, paddingRight: 4, paddingTop: 8, paddingBottom: 8 },
  order: {
    marginHorizontal: 0,
    marginVertical: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
