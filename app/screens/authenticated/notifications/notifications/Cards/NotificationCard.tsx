import * as React from 'react';
import { Avatar, Caption, Card, List } from 'react-native-paper';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAppSelector } from 'app/state';

interface INotification {
  title: string;
  description?: string | null;
  icon: string;
  timestamp: string;
  onPress?(): void;
}

export default function NotificationCard(props: INotification) {
  const { title, description, icon, timestamp, onPress } = props;
  const { theme, palette } = useAppSelector((root) => root.global);
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.notification} elevation={3}>
        <Card.Content style={styles.notificationContent}>
          <List.Item
            {...{ title, description }}
            style={{ width: '100%' }}
            titleStyle={styles.notificationTitle}
            descriptionStyle={styles.notificationDescription}
            left={() => (
              <Avatar.Icon
                size={55}
                {...{ icon }}
                color={theme.dark ? theme.colors.text : palette.accent.light}
                style={styles.avatarIcon}
              />
            )}
          />
          <Caption style={styles.timestamp}>
            {formatDistanceToNow(parseISO(timestamp), { addSuffix: true })}
          </Caption>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatarIcon: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginHorizontal: 12,
  },
  notificationTitle: {
    paddingLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    paddingLeft: 4,
  },
  notificationContent: { paddingLeft: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0 },
  notification: {
    margin: 0,
    paddingVertical: 8,
    marginVertical: 0,
    borderRadius: 2,
    width: '100%',
  },
  timestamp: {
    position: 'absolute',
    top: 4,
    right: 8,
  },
});
