import * as React from 'react';
import { Caption, Card, List, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { capitalize } from 'lodash';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { successColor } from '../../../constants/Colors';
import { Transaction } from '../../../api/schema';

interface ITransaction {
  transaction: Transaction;
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

export default function TransactionCard(props: ITransaction) {
  const { transaction, onPress } = props;
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.transaction}>
        <Card.Content style={styles.transactionContent}>
          <Caption
            style={{
              position: 'absolute',
              top: 4,
              right: 8,
            }}
          >
            {format(transaction?.createdAt * 1000, 'Mo MMM, h:mm aaa')}
          </Caption>
          <List.Item
            title={capitalize(transaction.status || '')}
            description={transaction.message || 'No message'}
            style={{ width: '100%' }}
            titleStyle={styles.transactionTitle}
            descriptionStyle={styles.transactionDescription}
            left={() => (
              <View style={{ width: 165, alignItems: 'center', flexDirection: 'row' }}>
                <MaterialCommunityIcons
                  color={
                    transaction.status && ['withdrawal', 'paid'].includes(transaction.status)
                      ? '#FF1414'
                      : successColor
                  }
                  name={getIcon(transaction.status)}
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
                  ${transaction.amount}
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
  transactionTitle: {
    paddingLeft: 0,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 0,
  },
  transactionDescription: {
    paddingLeft: 0,
  },
  transactionContent: { paddingLeft: 0, paddingRight: 4, paddingTop: 8, paddingBottom: 8 },
  transaction: {
    marginHorizontal: 0,
    marginVertical: StyleSheet.hairlineWidth,
    borderRadius: 2,
    width: '100%',
  },
});
