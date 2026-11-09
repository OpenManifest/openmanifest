import * as React from 'react';
import { capitalize } from 'lodash';
import { View } from 'react-native';
import { TransactionEssentialsFragment } from 'app/api/operations';
import { formatDateTime } from 'app/i18n/format';
import { formatCents } from 'app/utils/money';
import { Icon, ListRow, Text, useTheme } from 'app/ui';

interface ITransaction {
  transaction: TransactionEssentialsFragment;
  onPress?(): void;
}

function getIcon(status?: string | null) {
  switch (status) {
    case 'paid':
    case 'withdrawal':
      return 'cash-minus';
    case 'refunded':
    case 'deposit':
      return 'cash-plus';
    default:
      return 'cash';
  }
}

/** A transaction of a receipt: its kind, message and time, and the amount (out in the blocked colour) */
export default function TransactionCard(props: ITransaction) {
  const { transaction, onPress } = props;
  const theme = useTheme();
  const when = transaction?.createdAt ? formatDateTime(transaction.createdAt) : '';

  return (
    <View style={{ backgroundColor: theme.colour.surface }}>
      <ListRow
        title={transaction.transactionType.toUpperCase()}
        supporting={[capitalize(transaction.message || ''), when].filter(Boolean).join(' · ')}
        onPress={onPress}
        leading={
          <Icon
            name={getIcon(transaction.status)}
            tone={transaction.amountCents < 0 ? 'blocked' : 'ok'}
          />
        }
        trailing={<Text variant="title">{formatCents(transaction.amountCents)}</Text>}
      />
    </View>
  );
}
