import * as React from 'react';
import { View } from 'react-native';
import {
  OperatorEssentialsFragment,
  MembershipEssentialsFragment,
  OrderEssentialsFragment,
} from 'app/api/operations';
import { Membership } from 'app/api/schema.d';
import UserAvatar from 'app/components/UserAvatar';
import { formatDateTime } from 'app/i18n/format';
import { formatCents } from 'app/utils/money';
import { Icon, ListRow, Text, useTheme } from 'app/ui';

interface IOrder {
  order: OrderEssentialsFragment;
  membership?: MembershipEssentialsFragment | null;
  showAvatar?: boolean;
  onPress?(): void;
}

/** An order in a member's list of transactions: who paid, what for, when, and the amount (minus when they paid) */
export default function OrderCard(props: IOrder) {
  const { order, membership, showAvatar, onPress } = props;
  const theme = useTheme();
  const isSelfBuyer =
    order.buyer?.__typename === 'Membership' && (order.buyer as Membership)?.id === membership?.id;
  const buyerName =
    (order?.buyer as MembershipEssentialsFragment)?.user?.name ||
    (order?.buyer as OperatorEssentialsFragment)?.name ||
    '';
  const when = order?.createdAt ? formatDateTime(order.createdAt) : '';

  return (
    <View style={{ backgroundColor: theme.colour.surface }}>
      <ListRow
        title={buyerName}
        supporting={[order.title, when].filter(Boolean).join(' · ')}
        onPress={onPress}
        leading={
          showAvatar ? (
            <UserAvatar
              size={40}
              name={buyerName}
              image={
                (order?.buyer as MembershipEssentialsFragment)?.user?.image ||
                (order?.buyer as OperatorEssentialsFragment)?.banner ||
                undefined
              }
            />
          ) : (
            <Icon
              name={isSelfBuyer ? 'cash-minus' : 'cash-plus'}
              tone={isSelfBuyer ? 'blocked' : 'ok'}
            />
          )
        }
        trailing={
          <Text variant="body">{`${isSelfBuyer ? '-' : ''}${formatCents(order.amountCents)}`}</Text>
        }
      />
    </View>
  );
}
