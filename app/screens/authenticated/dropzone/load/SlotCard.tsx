import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, Card, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ViewProps } from 'app/components/Themed';
import { SlotDetailsFragment } from 'app/api/operations';
import { useDropzoneNavigation } from '../useDropzoneNavigation';

interface ISlotCardProps {
  slot: SlotDetailsFragment;
  style?: ViewProps['style'];
  onPress?(slot: SlotDetailsFragment): void;
  onDelete?(slot: SlotDetailsFragment): void;
}

export default function SlotCard(props: ISlotCardProps) {
  const { slot, onPress, onDelete, style } = props;
  const theme = useTheme();

  const hasPassenger = !!slot?.passengerName;
  const navigation = useDropzoneNavigation();
  return (
    <>
      <Card
        onPress={() =>
          slot.dropzoneUser?.id &&
          navigation.navigate('User', {
            screen: 'ProfileScreen',
            params: { userId: slot.dropzoneUser?.id },
          })
        }
        onLongPress={() => onPress?.(slot)}
        elevation={3}
        style={StyleSheet.flatten([styles.card, { marginBottom: hasPassenger ? -4 : 12 }, style])}
      >
        <Card.Title
          title={slot?.dropzoneUser?.user.name || slot?.passengerName}
          left={() =>
            slot?.dropzoneUser?.user?.image ? (
              <Avatar.Image
                style={{ backgroundColor: theme.colors.surface }}
                source={{ uri: slot?.dropzoneUser?.user.image }}
                size={42}
              />
            ) : (
              <Avatar.Icon
                style={{ backgroundColor: theme.colors.surface }}
                color={theme.dark ? theme.colors.text : theme.colors.primary}
                icon="account"
                size={42}
              />
            )
          }
          right={() =>
            !onDelete ? null : (
              <Badge
                style={{ marginTop: -45, marginRight: -5 }}
                onPress={(e) => {
                  e.preventDefault();
                  onDelete?.(slot);
                }}
              >
                -
              </Badge>
            )
          }
        />
        <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip
            style={styles.infoChip}
            textStyle={styles.chipText}
            icon="lock"
            mode="outlined"
            disabled
          >
            {slot?.dropzoneUser?.role?.name}
          </Chip>
          <Chip
            style={styles.infoChip}
            textStyle={styles.chipText}
            icon="ticket-account"
            mode="outlined"
            disabled
          >
            {slot?.dropzoneUser?.license?.name}
          </Chip>
          <Chip
            style={styles.infoChip}
            textStyle={styles.chipText}
            icon="human-handsup"
            mode="outlined"
            disabled
          >
            {slot?.jumpType?.name}
          </Chip>
          <Chip
            style={styles.infoChip}
            textStyle={styles.chipText}
            icon="arrow-up-bold"
            mode="outlined"
            disabled
          >
            {slot?.ticketType?.name}
          </Chip>
          {!slot.wingLoading ? null : (
            <Chip
              style={styles.chip}
              textStyle={styles.chipText}
              icon="escalator-down"
              mode="outlined"
              disabled
            >
              {slot.wingLoading.toFixed(2)}
            </Chip>
          )}
        </Card.Content>
      </Card>
      {!slot?.passengerName ? null : (
        <>
          <View
            style={{
              width: '100%',
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons color={theme.colors.onSurface} name="link-variant" size={30} />
          </View>
          <Card
            style={StyleSheet.flatten([
              { margin: 12, marginTop: -4, height: 150, width: '100%' },
              style,
            ])}
            elevation={3}
          >
            <Card.Title
              title={slot?.passengerName}
              left={() => (
                <Avatar.Icon
                  icon="account-supervisor"
                  color={theme.dark ? theme.colors.text : theme.colors.primary}
                  style={{ backgroundColor: theme.colors.surface }}
                  size={40}
                />
              )}
            />
            <Card.Content>
              <Text style={styles.passengerTitle}>P A S S E N G E R</Text>
            </Card.Content>
          </Card>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 12,
    height: 150,
    width: '100%',
  },
  chip: {
    margin: 2,
    height: 25,
    padding: 0,
    alignItems: 'center',
  },
  infoChip: {
    margin: 2,
    height: 25,
    padding: 0,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
  },
  passengerChip: {
    margin: 12,
    height: 150,
    width: '100%',
  },
  passengerTitle: {
    fontSize: 30,
    opacity: 0.5,
    alignSelf: 'center',
    width: '100%',
    textAlign: 'center',
    color: '#CCCCCC',
  },
});
