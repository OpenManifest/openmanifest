import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Paragraph, Title } from 'react-native-paper';

import { useAppSelector } from '../../../redux';
import { Load } from '../../../graphql/schema';
import { isAfter } from 'date-fns/esm';
import Countdown from '../manifest/Countdown';


interface ILoadHeader {
  load?: Load;
  canEdit?: boolean;
  children?: React.ReactNode;
  onEdit?(): void;
}
export default function UserHeader(props: ILoadHeader) {
  const { load, onEdit, canEdit, children } = props;
  const { theme } = useAppSelector(state => state.global);
  return (
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.actions}>
        {
          !canEdit ? null : (
            <IconButton
              icon="pencil"
              size={20}
              color={theme.colors.surface}
              onPress={() => onEdit ? onEdit() : null}
            />
          )}
        </View>
        <View style={styles.avatarContainer}>
          <View style={{ flex: 1/3 }}>
            {
              load.dispatchAt && isAfter(load.dispatchAt * 1000, new Date())
                ? <Countdown end={new Date(load.dispatchAt * 1000)} size={80} />
                : <Avatar.Icon
                    size={80}
                    icon="shield-airplane"
                    color={theme.colors.primary}
                    style={{ backgroundColor: theme.colors.surface }}
                  />
              }
          </View>
          <View style={styles.titleContainer}>
            <Title style={styles.title}>Load #{load?.loadNumber}</Title>
            <Paragraph style={styles.paragraph}>{load?.name}</Paragraph>
          </View>
        </View>

        {children}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 16
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleContainer: {
    paddingLeft: 48,
    flex: 2/3,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  title: {
    color: "white"
  },
  paragraph: {
    color: "white"
  }
});
