import * as React from 'react';
import { Caption, Card, List, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserSlotDetailsFragment } from 'app/api/operations';

interface ISlot {
  slot: UserSlotDetailsFragment;
  onPress?(): void;
}

export default function SlotCard(props: ISlot) {
  const { slot, onPress } = props;
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={{ width: '100%' }}>
      <Card style={styles.transaction}>
        <Card.Content style={styles.transactionContent}>
          <Caption
            style={{
              position: 'absolute',
              top: 0,
              right: 8,
            }}
          >
            {format((slot?.load?.dispatchAt || slot.createdAt) * 1000, 'Mo MMM, h:mm aaa')}
          </Caption>
          <List.Item
            title={`Load #${slot.load.loadNumber}`}
            description={slot.ticketType?.name}
            style={{ width: '100%' }}
            titleStyle={styles.transactionTitle}
            descriptionStyle={styles.transactionDescription}
            right={() => (
              <View
                style={{
                  width: 180,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  flexDirection: 'row',
                }}
              >
                <Text style={[styles.jumpType, { color: theme.colors.onSurface }]}>
                  {slot.jumpType?.name}
                </Text>
              </View>
            )}
            left={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons
                  color={theme.colors.text}
                  name="parachute-outline"
                  size={36}
                />
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
    marginBottom: 4,
  },
  jumpType: { fontSize: 24, marginLeft: 4, fontWeight: '100', textAlign: 'center' },
  transactionDescription: {
    paddingLeft: 0,
  },
  transactionContent: { paddingLeft: 0, paddingRight: 4, paddingTop: 4, paddingBottom: 4 },
  transaction: { margin: 0, marginBottom: 0, marginVertical: 0, borderRadius: 2, width: '100%' },
});
