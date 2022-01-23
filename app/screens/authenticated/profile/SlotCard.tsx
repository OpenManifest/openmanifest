import * as React from 'react';
import { Avatar, Card, List, useTheme } from 'react-native-paper';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
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
          <List.Item
            description={`on Load #${slot.load.loadNumber}`}
            title={slot.jumpType?.name}
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
                <Text
                  style={[
                    styles.jumpType,
                    {
                      color: theme.colors.onSurface,
                    },
                  ]}
                >
                  -${slot.cost?.toFixed(2)}
                </Text>
              </View>
            )}
            left={() => (
              <View
                style={{
                  width: 100,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Avatar.Icon
                  icon="parachute-outline"
                  size={48}
                  style={{ alignSelf: 'center', marginHorizontal: 12 }}
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    flexGrow: 1,
  },
  jumpType: {
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    fontWeight: '400',
    textAlign: 'center',
    alignSelf: 'center',
  },
  transactionDescription: {
    paddingLeft: 0,
    flexGrow: 1,
    minWidth: 150,
  },
  transactionContent: { paddingLeft: 0, paddingRight: 4, paddingTop: 8, paddingBottom: 8 },
  transaction: { margin: 0, marginBottom: 0, marginVertical: 0, borderRadius: 2, width: '100%' },
});
